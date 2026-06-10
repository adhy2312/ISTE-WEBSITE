import { NextResponse } from 'next/server';

/**
 * ==========================================
 * ELITE INTERNSHIP AGENT ARCHITECTURE (v3)
 * ==========================================
 * This route delegates the heavy lifting to the FastAPI/Celery backend.
 * It strictly acts as a trigger point.
 */

export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('[AI Gateway] Dispatching job to Central Engine...');
    
    // Dispatch to FastAPI backend
    const fastApiUrl = process.env.FASTAPI_URL || 'http://localhost:8000';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);
      
      const res = await fetch(`${fastApiUrl}/jobs/start`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.CRON_SECRET}`
        },
        body: JSON.stringify({ source: 'all' }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      
      if (!res.ok) {
        throw new Error(`Gateway responded with ${res.status}`);
      }
      
      const data = await res.json();
      
      return NextResponse.json({
        success: true,
        message: 'Job successfully dispatched to Celery Queue',
        jobId: data.job_id,
        sseStreamUrl: `${fastApiUrl}/jobs/${data.job_id}/events`
      });
      
    } catch (e: any) {
      console.error('[AI Gateway] Celery Backend Unreachable:', e.message);
      
      // Implement fallback logic here if needed, or simply fail gracefully
      return NextResponse.json({ 
        success: false, 
        error: 'Celery Backend Offline or Unreachable',
        details: e.message 
      }, { status: 503 });
    }

  } catch (error: any) {
    console.error('[AI Gateway] Critical Dispatch Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
