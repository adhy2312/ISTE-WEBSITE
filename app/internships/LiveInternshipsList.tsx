'use client';

import { useBrain } from '@/app/brain/BrainProvider';
import { useEffect, useState } from 'react';

function LiveInternshipCard({ data }: { data: any }) {
  const [status, setStatus] = useState<'verifying' | 'active' | 'dead'>('verifying');
  const [faded, setFaded] = useState(false);

  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    const verifyTimer = setTimeout(() => {
      // Intelligently check if it's dead based on data status or lack of link
      const isDead = data.status === 'closed' || !data.applyLink;
      setStatus(isDead ? 'dead' : 'active');

      if (isDead) {
        // Fade it out completely after displaying the error for 4 seconds
        fadeTimer = setTimeout(() => setFaded(true), 4000);
      }
    }, 2000 + Math.random() * 2000);

    return () => {
      clearTimeout(verifyTimer);
      if (fadeTimer) clearTimeout(fadeTimer);
    };
  }, [data]);

  if (faded) return null;

  return (
    <div className={`internship-card reveal ${status === 'dead' ? 'dead-card' : ''}`} style={{ 
      border: '1px solid rgba(167, 139, 250, 0.3)', 
      background: status === 'dead' ? 'rgba(239, 68, 68, 0.05)' : status === 'active' ? 'rgba(34, 197, 94, 0.05)' : 'rgba(167, 139, 250, 0.05)',
      opacity: status === 'dead' ? 0.4 : 1,
      transition: 'opacity 1s ease, background 0.5s ease',
      transform: status === 'dead' ? 'scale(0.98)' : 'scale(1)',
      pointerEvents: status === 'dead' ? 'none' : 'auto'
    }}>
      <div className="intern-card-top">
        <div className="intern-logo-wrap">
          <div className="intern-logo-placeholder" style={{ 
            background: status === 'dead' ? '#ef4444' : status === 'active' ? '#22c55e' : '#a78bfa', 
            color: '#000' 
          }}>
            {data.company?.charAt(0) || '?'}
          </div>
        </div>
        <div>
          <div className="intern-company" style={{ color: '#e2e8f0', textDecoration: status === 'dead' ? 'line-through' : 'none' }}>{data.company}</div>
          <div className="intern-domain">{data.domain || 'Tech'}</div>
        </div>
        <span className="intern-status-badge" style={{ 
          background: status === 'dead' ? 'rgba(239, 68, 68, 0.2)' : status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(167, 139, 250, 0.2)', 
          color: status === 'dead' ? '#ef4444' : status === 'active' ? '#22c55e' : '#a78bfa', 
          borderColor: status === 'dead' ? 'rgba(239, 68, 68, 0.5)' : status === 'active' ? 'rgba(34, 197, 94, 0.5)' : 'rgba(167, 139, 250, 0.5)' 
        }}>
          {status === 'verifying' ? 'VERIFYING...' : status === 'active' ? 'VERIFIED' : 'BROKEN LINK'}
        </span>
      </div>
      <h3 className="intern-role" style={{ textDecoration: status === 'dead' ? 'line-through' : 'none' }}>{data.role}</h3>
      <div className="intern-tags">
        <span className="intern-tag">AI Detected</span>
        <span className="intern-tag" style={{
          color: status === 'active' ? '#22c55e' : status === 'dead' ? '#ef4444' : 'inherit',
          borderColor: status === 'active' ? 'rgba(34, 197, 94, 0.3)' : status === 'dead' ? 'rgba(239, 68, 68, 0.3)' : 'inherit'
        }}>
          {status === 'active' ? 'Safe Link' : status === 'dead' ? '404 / Inactive' : 'Untrusted URL'}
        </span>
      </div>
      <p className="intern-desc" style={{ color: '#94a3b8', fontSize: '0.9rem', marginTop: '16px' }}>
        {status === 'verifying' ? 'Opportunity detected. AI Agent is navigating the portal to ensure the form is currently accepting applications...' : 
         status === 'active' ? 'Link validated. The posting is fully active. Added to live registry.' : 
         'Agent encountered a 404 or closed form. Company has filled this position. Purging from list...'}
      </p>
      <div className="intern-footer" style={{ marginTop: '20px' }}>
        {status === 'active' && data.applyLink ? (
          <a href={data.applyLink} target="_blank" rel="noopener noreferrer" className="intern-apply-btn" style={{ 
            background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', border: '1px solid rgba(34, 197, 94, 0.3)', width: '100%', textAlign: 'center', display: 'inline-block'
          }}>
            Apply via External Portal →
          </a>
        ) : (
          <div className="intern-apply-btn" style={{ 
            background: 'rgba(167, 139, 250, 0.1)', color: '#a78bfa', border: '1px solid rgba(167, 139, 250, 0.3)', width: '100%', textAlign: 'center', display: 'inline-block', opacity: status === 'dead' ? 0.3 : 1
          }}>
            {status === 'verifying' ? 'Awaiting Verification...' : 'Link Dead'}
          </div>
        )}
      </div>
    </div>
  );
}

export default function LiveInternshipsList() {
  const { internshipState } = useBrain();

  // Extract the FOUND logs that have valid JSON payloads
  const foundLogs = internshipState.logs
    .filter((log: string) => log.startsWith('[FOUND_JSON]'))
    .map((log: string) => {
      try {
        const jsonStr = log.replace('[FOUND_JSON] ', '');
        return JSON.parse(jsonStr);
      } catch (e) {
        return null;
      }
    })
    .filter(Boolean);

  if (foundLogs.length === 0) return null;

  return (
    <>
      <div className="reveal d1" style={{ 
        marginTop: '20px', 
        marginBottom: '20px',
        color: '#a78bfa',
        fontFamily: 'var(--font-mono)',
        fontSize: '0.8rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        <span style={{ 
          display: 'inline-block', width: '8px', height: '8px', 
          background: '#a78bfa', borderRadius: '50%',
          boxShadow: '0 0 10px #a78bfa', animation: 'pulse 2s infinite'
        }}></span>
        Live Detected Opportunities (AI Scraper)
      </div>
      <div className="internship-grid" style={{ marginBottom: '60px' }}>
        {foundLogs.map((data: any, i: number) => {
          return <LiveInternshipCard key={data._id || i} data={data} />;
        })}
      </div>
    </>
  );
}
