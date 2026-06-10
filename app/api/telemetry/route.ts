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
