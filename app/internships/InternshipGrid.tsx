'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import Image from 'next/image'
import type { InternshipData } from './page'
import { Search } from 'lucide-react'
import { gsap, useGSAP } from '@/app/brain/engines/GSAPCore'

export default function InternshipGrid({ internships }: { internships: InternshipData[] }) {
  const [isHunting, setIsHunting] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Simulate "Hunting/Deciphering" on search query changes
  useEffect(() => {
    if (isHunting) {
      const t = setTimeout(() => setIsHunting(false), 800)
      return () => clearTimeout(t)
    }
  }, [searchQuery, isHunting])

  const filtered = useMemo(() => {
    if (!searchQuery) return internships;
    const lower = searchQuery.toLowerCase()
    return internships.filter(i => 
      (i.role?.toLowerCase() || '').includes(lower) ||
      (i.company?.toLowerCase() || '').includes(lower) ||
      (i.domain?.toLowerCase() || '').includes(lower)
    )
  }, [internships, searchQuery])

  useGSAP(() => {
    if (!isHunting && filtered.length > 0 && containerRef.current) {
      gsap.fromTo('.gsap-internship-card',
        { y: 40, opacity: 0, scale: 0.95 },
        {
          y: 0,
          opacity: 1,
          scale: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          clearProps: 'all' // prevents sticking inline styles
        }
      )
    }
  }, [isHunting, filtered])

  return (
    <div className="internship-grid-container" style={{ width: '100%' }}>
      {/* Command-K Style Search Bar */}
      <div style={{
        position: 'relative',
        marginBottom: '40px',
        maxWidth: '600px',
        margin: '0 auto 48px auto'
      }}>
        <div style={{
          position: 'absolute',
          left: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          color: '#64748b',
          pointerEvents: 'none'
        }}>
          <Search size={20} />
        </div>
        <input
          type="text"
          placeholder="Filter by role, company, or domain..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value)
            setIsHunting(true)
          }}
          style={{
            width: '100%',
            padding: '16px 20px 16px 48px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            borderRadius: '12px',
            color: '#f8fafc',
            fontSize: '1rem',
            fontFamily: 'var(--font-mono)',
            outline: 'none',
            transition: 'all 0.3s ease',
            boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#3b82f6'
            e.target.style.background = 'rgba(255, 255, 255, 0.05)'
            e.target.style.boxShadow = '0 0 0 3px rgba(59, 130, 246, 0.2)'
          }}
          onBlur={(e) => {
            e.target.style.borderColor = 'rgba(255, 255, 255, 0.1)'
            e.target.style.background = 'rgba(255, 255, 255, 0.03)'
            e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.2)'
          }}
        />
        <div style={{
          position: 'absolute',
          right: '16px',
          top: '50%',
          transform: 'translateY(-50%)',
          display: 'flex',
          gap: '4px'
        }}>
          <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>⌘</kbd>
          <kbd style={{ background: 'rgba(255,255,255,0.1)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.1)' }}>K</kbd>
        </div>
      </div>

      {filtered.length === 0 && !isHunting ? (
        <div className="reveal" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--g400)' }}>
          <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--white)', marginBottom: '10px' }}>No matches found</div>
          <div style={{ fontSize: '.9rem' }}>Try adjusting your search filters.</div>
        </div>
      ) : (
        <div className="internship-grid" ref={containerRef}>
          {isHunting ? (
            // Skeletons
            [...Array(Math.min(filtered.length || 4, 8))].map((_, i) => (
              <div key={`skel-${i}`} className="internship-card skeleton-card">
                <div className="intern-card-top">
                  <div className="skel-logo"></div>
                  <div style={{ flex: 1 }}>
                    <div className="skel-line" style={{ width: '60%' }}></div>
                    <div className="skel-line" style={{ width: '40%', marginTop: '8px' }}></div>
                  </div>
                </div>
                <div className="skel-line" style={{ width: '80%', height: '24px', margin: '24px 0' }}></div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <div className="skel-tag"></div>
                  <div className="skel-tag"></div>
                </div>
              </div>
            ))
          ) : (
            // Real Cards
            filtered.map((intern, i) => (
              <div key={intern._id} className={`internship-card gsap-internship-card`} style={{ position: 'relative', opacity: 0 }}>
                <div className="intern-card-top">
                  <div className="intern-logo-wrap" style={{ position: 'relative' }}>
                    {intern.logo?.asset ? (
                      <Image
                        src={intern.logo.asset.url || ''}
                        alt={intern.company || 'Company logo'}
                        fill
                        className="object-contain"
                      />
                    ) : (
                      <div className="intern-logo-placeholder">
                        {(intern.company || '?').charAt(0)}
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="intern-company">{intern.company || 'Unknown Company'}</div>
                    {intern.domain && <div className="intern-domain">{intern.domain}</div>}
                  </div>
                </div>

                <h3 className="intern-role">{intern.role}</h3>

                {/* Match Score UI container (to be populated later via context/props) */}
                {intern.matchScore && (
                  <div style={{
                    position: 'absolute', top: '-10px', right: '-10px',
                    background: intern.matchScore > 80 ? '#22c55e' : intern.matchScore > 50 ? '#f59e0b' : '#3b82f6',
                    color: '#fff', padding: '4px 12px', borderRadius: '12px',
                    fontSize: '0.8rem', fontWeight: 'bold', border: '2px solid var(--black)',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.3)', zIndex: 10
                  }}>
                    {intern.matchScore}% Match
                  </div>
                )}

                <div className="intern-tags">
                  {intern.type && <span className="intern-tag">{intern.type}</span>}
                  {intern.stipend && <span className="intern-tag">{intern.stipend}</span>}
                  {intern.duration && <span className="intern-tag">{intern.duration}</span>}
                </div>

                {intern.description && (
                  <p className="intern-desc">{intern.description}</p>
                )}

                <div className="intern-footer">
                  {intern.deadlineLabel && (
                    <div className="intern-deadline">
                      <span>⏱</span> Deadline: {intern.deadlineLabel}
                    </div>
                  )}
                  <a
                    href={intern.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="intern-apply-btn"
                    onClick={() => {
                      try {
                        const token = typeof window !== 'undefined' ? localStorage.getItem('session_token') || 'demo-jwt-token' : '';
                        fetch('/api/telemetry', {
                          method: 'POST',
                          headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                          },
                          body: JSON.stringify({
                            action: 'click',
                            job_id: intern._id,
                            role: intern.role,
                            domain: intern.domain,
                            company: intern.company
                          }),
                          keepalive: true
                        }).catch(() => {});
                      } catch (e) {}
                    }}
                  >
                    Apply Now →
                  </a>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <style jsx>{`
        .skeleton-card {
          position: relative;
          overflow: hidden;
          background: rgba(255,255,255,0.02) !important;
          border-color: rgba(255,255,255,0.05) !important;
        }
        .skeleton-card::after {
          content: '';
          position: absolute;
          top: 0; left: -100%; width: 50%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.04), transparent);
          animation: scan 1.5s infinite linear;
        }
        @keyframes scan {
          0% { left: -100%; }
          100% { left: 200%; }
        }
        .skel-logo {
          width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.05);
        }
        .skel-line {
          height: 12px; border-radius: 6px; background: rgba(255,255,255,0.05);
        }
        .skel-tag {
          width: 80px; height: 28px; border-radius: 14px; background: rgba(255,255,255,0.05);
        }
      `}</style>
    </div>
  )
}
