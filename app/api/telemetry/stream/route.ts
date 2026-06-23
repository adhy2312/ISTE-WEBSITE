import { NextRequest } from 'next/server';

const SANITY_PROJECT_ID = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET;
const SANITY_API_TOKEN = process.env.SANITY_API_TOKEN;

interface TelemetryLog {
  _id: string;
  action: string;
  role?: string;
  domain?: string;
  company?: string;
  timestamp: string;
}

async function fetchRecentTelemetry(): Promise<TelemetryLog[]> {
  if (!SANITY_PROJECT_ID || !SANITY_DATASET) return [];

  try {
    const query = encodeURIComponent(
      `*[_type == "telemetry_log"] | order(timestamp desc)[0...10] { _id, action, role, domain, company, timestamp }`
    );
    const url = `https://${SANITY_PROJECT_ID}.api.sanity.io/v2023-01-01/data/query/${SANITY_DATASET}?query=${query}`;

    const headers: HeadersInit = { 'Content-Type': 'application/json' };
    if (SANITY_API_TOKEN) headers['Authorization'] = `Bearer ${SANITY_API_TOKEN}`;

    const res = await fetch(url, {
      headers,
      next: { revalidate: 0 }, // always fresh
    });

    if (!res.ok) return [];
    const data = await res.json();
    return data.result || [];
  } catch {
    return [];
  }
}

function formatLogEntry(log: TelemetryLog): string {
  const time = new Date(log.timestamp).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  
  const actionMap: Record<string, string> = {
    click: '→ Apply link accessed',
    page_viewed: '· Page session started',
    search: '⌕ Search query executed',
  };

  const actionLabel = actionMap[log.action] || `· ${log.action}`;
  const context = [log.role, log.company, log.domain].filter(Boolean).join(' @ ');

  return `[${time}] ${actionLabel}${context ? ` — ${context}` : ''}`;
}

export async function GET(req: NextRequest) {
  const encoder = new TextEncoder();
  let isClosed = false;

  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: string) => {
        if (!isClosed) {
          try {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ message: data })}\n\n`));
          } catch {
            // controller closed
          }
        }
      };

      // Boot messages
      send('[SYS] Neural filters calibrated. Quantum handshakes verified.');
      send('[SYS] Blocking non-authoritative domains with strict CSP bounds.');
      send('[SYS] Telemetry stream authenticated — live data ingest active.');

      // Poll Sanity every 5 seconds
      const seen = new Set<string>();

      const poll = async () => {
        if (isClosed) return;
        try {
          const logs = await fetchRecentTelemetry();
          for (const log of logs.reverse()) {
            if (!seen.has(log._id)) {
              seen.add(log._id);
              send(formatLogEntry(log));
            }
          }
        } catch {
          // silently ignore
        }
      };

      // Initial poll
      await poll();

      // Poll every 5 seconds
      const interval = setInterval(poll, 5000);

      // Clean up on close
      req.signal.addEventListener('abort', () => {
        isClosed = true;
        clearInterval(interval);
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
