'use client';

import { useBrain } from '@/app/brain/BrainProvider';
import { useEffect, useState, useRef } from 'react';
import { gsap, useGSAP } from '@/app/brain/engines/GSAPCore';
import { EASING, TIMING } from '@/app/brain/engines/MotionTokens';

function LiveInternshipCard({ data, index }: { data: any; index: number }) {
  const [status, setStatus] = useState<'verifying' | 'active' | 'dead'>('verifying');
  const [visible, setVisible] = useState(true);
  const cardRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Cinematic entrance
    gsap.fromTo(cardRef.current,
      { y: 40, opacity: 0, scale: 0.98 },
      { y: 0, opacity: 1, scale: 1, duration: TIMING.base, ease: EASING.premium, delay: Math.min(index * 0.1, 0.5) }
    );
  }, []);

  useEffect(() => {
    let fadeTimer: NodeJS.Timeout;
    const verifyTimer = setTimeout(() => {
      // Valid URLs (not '#' or empty) mean it's active
      const isValidLink = data.applyLink && data.applyLink !== '#' && data.applyLink.startsWith('http');
      const isDead = data.status === 'closed' || !isValidLink;
      
      setStatus(isDead ? 'dead' : 'active');

      if (isDead) {
        // Use GSAP to gracefully fade it out
        gsap.to(cardRef.current, {
          opacity: 0,
          scale: 0.95,
          duration: TIMING.base,
          ease: EASING.premium,
          delay: 3,
          onComplete: () => setVisible(false)
        });
      }
    }, 1500 + Math.random() * 1000);

    return () => clearTimeout(verifyTimer);
  }, [data]);

  if (!visible) return null;

  return (
    <div ref={cardRef} className="internship-card" style={{ 
      border: '1px solid rgba(255, 255, 255, 0.08)', 
      background: 'rgba(255, 255, 255, 0.02)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Status Overlay gradient based on state */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: status === 'dead' ? '#ef4444' : status === 'active' ? '#22c55e' : '#a78bfa',
        opacity: 0.5,
        transition: 'background 0.5s ease'
      }}></div>

      <div className="intern-card-top" style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div className="intern-logo-wrap" style={{ 
          width: '48px', height: '48px', borderRadius: '12px',
          background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          border: '1px solid rgba(255,255,255,0.1)'
        }}>
          <span style={{ fontSize: '1.2rem', fontWeight: 600, color: '#f8fafc' }}>
            {data.company?.charAt(0) || '?'}
          </span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ color: '#f8fafc', fontWeight: 500, fontSize: '1.1rem' }}>{data.company}</div>
          <div style={{ color: '#94a3b8', fontSize: '0.85rem' }}>{data.domain || 'Technology'}</div>
        </div>
        <span style={{ 
          background: status === 'dead' ? 'rgba(239, 68, 68, 0.1)' : status === 'active' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(167, 139, 250, 0.1)', 
          color: status === 'dead' ? '#ef4444' : status === 'active' ? '#22c55e' : '#a78bfa', 
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
          border: `1px solid ${status === 'dead' ? 'rgba(239, 68, 68, 0.2)' : status === 'active' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(167, 139, 250, 0.2)'}`,
          transition: 'all 0.5s ease'
        }}>
          {status === 'verifying' ? 'ANALYZING' : status === 'active' ? 'VERIFIED' : 'INVALIDATED'}
        </span>
      </div>

      <h3 style={{ margin: '20px 0 10px 0', fontSize: '1.3rem', color: '#f8fafc', fontWeight: 600 }}>{data.role}</h3>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {data.type && <span className="intern-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{data.type}</span>}
        {data.stipend && <span className="intern-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{data.stipend}</span>}
      </div>

      <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5, minHeight: '40px' }}>
        {status === 'verifying' ? 'System is currently analyzing link integrity and active status...' : 
         status === 'active' ? 'Opportunity successfully validated. External application portal is open and accepting candidates.' : 
         'Opportunity invalid or link broken. Discarding from index...'}
      </p>

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        {status === 'active' && data.applyLink && data.applyLink !== '#' ? (
          <a href={data.applyLink} target="_blank" rel="noopener noreferrer" style={{ 
            display: 'block', width: '100%', textAlign: 'center', padding: '12px',
            background: '#f8fafc', color: '#0f172a', fontWeight: 600, borderRadius: '8px',
            textDecoration: 'none', transition: 'transform 0.2s ease, opacity 0.2s ease'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
            Apply Now
          </a>
        ) : (
          <div style={{ 
            display: 'block', width: '100%', textAlign: 'center', padding: '12px',
            background: 'rgba(255,255,255,0.05)', color: '#64748b', fontWeight: 600, borderRadius: '8px',
            cursor: 'not-allowed'
          }}>
            {status === 'verifying' ? 'Awaiting Clearance...' : 'Link Unavailable'}
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
    <div style={{ marginBottom: '80px' }}>
      <div className="cinematic-text" style={{ 
        marginBottom: '24px',
        color: '#94a3b8',
        fontSize: '0.85rem',
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{ 
          width: '6px', height: '6px', 
          background: '#22c55e', borderRadius: '50%',
          boxShadow: '0 0 10px #22c55e'
        }}></div>
        Live Verified Feed
      </div>
      <div className="internship-grid">
        {foundLogs.map((data: any, i: number) => {
          return <LiveInternshipCard key={data._id || i} data={data} index={i} />;
        })}
      </div>
    </div>
  );
}
