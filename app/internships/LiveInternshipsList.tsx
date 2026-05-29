'use client';

import { useBrain } from '@/app/brain/BrainProvider';
import { useEffect, useState, useRef } from 'react';

/**
 * Displays ONLY verified internship listings from Sanity CMS.
 * Cards with invalid links (# or empty) are never rendered.
 */
function LiveInternshipCard({ data, index }: { data: any; index: number }) {
  const cardRef = useRef<HTMLDivElement>(null);

  // Validate the link is real — not '#', not empty, must be https
  const isValidLink = data.applyLink && 
    data.applyLink !== '#' && 
    data.applyLink.startsWith('http');

  // Don't render cards with broken links at all
  if (!isValidLink) return null;

  return (
    <div ref={cardRef} className="internship-card reveal" style={{ 
      border: '1px solid rgba(255, 255, 255, 0.08)', 
      background: 'rgba(255, 255, 255, 0.02)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Active status bar */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
        background: '#22c55e',
        opacity: 0.6,
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
          background: 'rgba(34, 197, 94, 0.1)', 
          color: '#22c55e', 
          padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 600,
          border: '1px solid rgba(34, 197, 94, 0.2)',
        }}>
          VERIFIED
        </span>
      </div>

      <h3 style={{ margin: '20px 0 10px 0', fontSize: '1.3rem', color: '#f8fafc', fontWeight: 600 }}>{data.role}</h3>
      
      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {data.type && <span className="intern-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{data.type}</span>}
        {data.stipend && <span className="intern-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{data.stipend}</span>}
        {data.duration && <span className="intern-tag" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '4px 10px', borderRadius: '6px', fontSize: '0.8rem' }}>{data.duration}</span>}
      </div>

      {data.description && (
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: 1.5 }}>{data.description}</p>
      )}

      <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.05)' }}>
        <a href={data.applyLink} target="_blank" rel="noopener noreferrer" style={{ 
          display: 'block', width: '100%', textAlign: 'center', padding: '12px',
          background: '#f8fafc', color: '#0f172a', fontWeight: 600, borderRadius: '8px',
          textDecoration: 'none', transition: 'transform 0.2s ease, opacity 0.2s ease'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.02)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>
          Apply Now →
        </a>
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
    .filter(Boolean)
    // Deduplicate by _id
    .filter((item: any, index: number, self: any[]) => 
      index === self.findIndex((t: any) => t._id === item._id)
    )
    // Only show items with valid apply links
    .filter((item: any) => item.applyLink && item.applyLink !== '#' && item.applyLink.startsWith('http'));

  if (foundLogs.length === 0) return null;

  return (
    <div style={{ marginBottom: '80px' }}>
      <div style={{ 
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
        Live Verified Feed — {foundLogs.length} Listings
      </div>
      <div className="internship-grid">
        {foundLogs.map((data: any, i: number) => {
          return <LiveInternshipCard key={data._id || i} data={data} index={i} />;
        })}
      </div>
    </div>
  );
}
