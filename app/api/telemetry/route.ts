import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const authHeader = req.headers.get('Authorization');
    // Optional: Validate JWT token here if desired, otherwise bypass
    
    const body = await req.json();
    const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
    const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET;
    const token = process.env.SANITY_API_TOKEN;

    if (!projectId || !dataset || !token) {
      console.warn('Sanity credentials missing, skipping telemetry recording.');
      return NextResponse.json({ status: 'ignored_no_credentials' });
    }

    // [GO TELEMETRY ENGINE INTEGRATION]
    // Attempt to offload high-throughput telemetry to our blazing-fast Go microservice
    try {
      const goRes = await fetch('http://localhost:8080/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
        signal: AbortSignal.timeout(500) // Super fast timeout, don't block
      });
      if (goRes.ok) {
        console.log("⚡ Telemetry successfully offloaded to Go Engine");
        return NextResponse.json({ status: 'recorded_by_go' });
      }
    } catch (e) {
      // Go engine is probably not running, fall back gracefully to standard Sanity API
      console.log("Go Telemetry Engine not available, falling back to standard API...");
    }

    // Push Telemetry to Sanity CMS as a custom "telemetry_log" document
    const mutation = {
      mutations: [
        {
          create: {
            _type: 'telemetry_log',
            job_id: body.job_id || 'unknown',
            action: body.action || 'click',
            role: body.role || 'unknown',
            domain: body.domain || 'unknown',
            company: body.company || 'unknown',
            timestamp: new Date().toISOString()
          }
        }
      ]
    };

    const res = await fetch(`https://${projectId}.api.sanity.io/v2023-01-01/data/mutate/${dataset}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(mutation)
    });

    if (!res.ok) {
      console.error('Failed to write telemetry to Sanity:', await res.text());
    }

    return NextResponse.json({ status: 'recorded' });
  } catch (err) {
    console.error('Telemetry route error:', err);
    return NextResponse.json({ error: 'Internal Error' }, { status: 500 });
  }
}
