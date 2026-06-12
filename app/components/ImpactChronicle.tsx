'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// ── Static Chronicle data ─────────────────────────────────────────────────────
// Milestones are the permanent record of the chapter. Add to this array in
// chronological order — newest LAST so the feed reads bottom-up like a log.
const MILESTONES = [
  { year: '2019', code: 'CHARTER_INIT',   label: 'Chapter chartered under ISTE National.',                      type: 'FOUNDATION' },
  { year: '2021', code: 'FIRST_NEXORA',   label: 'Nexora — first all-Kerala student convention hosted.',         type: 'EVENT'     },
  { year: '2022', code: 'INDUS_BRIDGE',   label: '5 industry partnerships formalised with Technopark firms.',   type: 'MILESTONE' },
  { year: '2023', code: 'INTERN_V1',      label: 'Internship Launchpad v1 deployed — 18 listings in week 1.',   type: 'TECH'      },
  { year: '2024', code: 'SKILL_MAAYA',    label: 'SKILL MAAYA 3-day bootcamp — 200+ attendees across Kerala.',  type: 'EVENT'     },
  { year: '2025', code: 'AI_ENGINE_V8',   label: 'Autonomous AI internship engine v8 — live scraping 60+ sources.', type: 'TECH' },
  { year: '2026', code: 'NEXORA_26',      label: "Nexora '26 — all-Kerala annual ISTE convention, MBCET hosts.", type: 'EVENT'   },
  { year: '2026', code: 'ENGINE_V10',     label: '13-agent CHANAKYAN-KV v10 engine deployed. Kerala-first.',     type: 'TECH'     },
];

const TYPE_META: Record<string, { color: string; glyph: string }> = {
  FOUNDATION: { color: '#f59e0b', glyph: '◆' },
  EVENT:      { color: '#06b6d4', glyph: '●' },
  MILESTONE:  { color: '#10b981', glyph: '▲' },
  TECH:       { color: '#8b5cf6', glyph: '⬡' },
};

// ── Metric card data ──────────────────────────────────────────────────────────
const METRIC_PANELS = [
  { value: '300+',  label: 'Enrolled Members',       sub: 'Active & verified',                   accent: '#06b6d4' },
  { value: '50+',   label: 'Events Conducted',        sub: 'Workshops · Talks · Competitions',    accent: '#10b981' },
  { value: '6',     label: 'Years of Operation',      sub: 'Continuously active since 2019',      accent: '#f59e0b' },
  { value: '60+',   label: 'Internship Sources',      sub: 'Scraped live by AI engine',           accent: '#8b5cf6' },
];

// ── Component ─────────────────────────────────────────────────────────────────
export default function ImpactChronicle({
  stats,
  events,
}: {
  stats: { label: string; value: number; suffix: string }[];
  events: { title: string; dateLabel: string; eventType: string }[];
}) {
  const sectionRef   = useRef<HTMLElement>(null);
  const logRef       = useRef<HTMLDivElement>(null);
  const [visibleRows, setVisibleRows] = useState(0);
  const [scanY, setScanY]             = useState(0);
  const animating                     = useRef(false);

  // ── Ticker: reveal log rows one-by-one on scroll-enter ───────────────────
  useGSAP(() => {
    if (!sectionRef.current || !logRef.current) return;

    const rows = logRef.current.querySelectorAll<HTMLElement>('.chronicle-row');

    ScrollTrigger.create({
      trigger: sectionRef.current,
      start: 'top 70%',
      once: true,
      onEnter: () => {
        if (animating.current) return;
        animating.current = true;
        rows.forEach((row, i) => {
          setTimeout(() => {
            row.classList.add('chronicle-row--visible');
            if (i === rows.length - 1) animating.current = false;
          }, i * 95);
        });
      },
    });

    // Metric panels stagger-in
    gsap.fromTo('.impact-metric', 
      { opacity: 0, y: 32 },
      {
        opacity: 1, y: 0, duration: 0.7,
        stagger: 0.12, ease: 'expo.out',
        scrollTrigger: { trigger: sectionRef.current, start: 'top 65%', once: true },
      }
    );

    // Scanline animation on the terminal panel
    gsap.to('.chronicle-scan', {
      top: '100%', duration: 2.4, ease: 'none', repeat: -1, delay: 0.8,
    });

  }, { scope: sectionRef });

  return (
    <section
      id="impact-chronicle"
      ref={sectionRef}
      style={{
        background: 'var(--black)',
        borderTop: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        position: 'relative',
        overflow: 'hidden',
        padding: '120px 0',
      }}
    >
      {/* ── Atmospheric depth gradient ───────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none',
        background: 'radial-gradient(ellipse 80% 50% at 50% 100%, rgba(6,182,212,0.04) 0%, transparent 70%)',
      }} />

      {/* ── Subtle dot-grid texture ──────────────────────────────────────── */}
      <div style={{
        position: 'absolute', inset: 0, pointerEvents: 'none', opacity: 0.35,
        backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.08) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />

      <div className="section-inner" style={{ position: 'relative', zIndex: 1 }}>

        {/* ── Header ──────────────────────────────────────────────────────── */}
        <div style={{ marginBottom: 72 }}>
          <div className="section-tag reveal">Chapter Record</div>
          <h2 className="section-title reveal d1">
            The <em>Impact</em><br />Chronicle
          </h2>
          <p className="section-body reveal d2" style={{ marginTop: 20, maxWidth: 520 }}>
            Not words. Numbers. A permanent, verifiable record of what this chapter has built since its founding.
          </p>
        </div>

        {/* ── Layout: terminal log (left) + metric panels (right) ─────────── */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 32,
          alignItems: 'start',
        }}
          className="chronicle-grid"
        >
          {/* ── Terminal Log Panel ─────────────────────────────────────────── */}
          <div style={{
            background: 'rgba(0,0,0,0.6)',
            border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 16,
            overflow: 'hidden',
            position: 'relative',
          }}>
            {/* Terminal chrome bar */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,255,255,0.05)',
              background: 'rgba(255,255,255,0.02)',
            }}>
              {['#ef4444','#f59e0b','#10b981'].map(c => (
                <div key={c} style={{ width: 10, height: 10, borderRadius: '50%', background: c, opacity: 0.7 }} />
              ))}
              <span style={{
                marginLeft: 12, fontFamily: '"JetBrains Mono", monospace',
                fontSize: '0.72rem', color: 'rgba(255,255,255,0.25)',
                letterSpacing: '0.08em', textTransform: 'uppercase',
              }}>
                CHANAKYAN-KV / chapter.log — READ ONLY
              </span>
            </div>

            {/* Scanline effect */}
            <div
              className="chronicle-scan"
              style={{
                position: 'absolute', top: 0, left: 0, right: 0,
                height: 2,
                background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.4), transparent)',
                zIndex: 2, pointerEvents: 'none',
              }}
            />

            {/* Log rows */}
            <div
              ref={logRef}
              style={{ padding: '24px 0', display: 'flex', flexDirection: 'column' }}
            >
              {MILESTONES.map((m, i) => {
                const meta = TYPE_META[m.type] || TYPE_META.MILESTONE;
                return (
                  <div
                    key={m.code}
                    className="chronicle-row"
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '52px 28px 1fr',
                      gap: '0 16px',
                      alignItems: 'start',
                      padding: '10px 24px',
                      opacity: 0,
                      transform: 'translateX(-8px)',
                      transition: 'opacity 0.35s ease, transform 0.35s ease',
                      borderBottom: i < MILESTONES.length - 1 ? '1px solid rgba(255,255,255,0.03)' : 'none',
                    }}
                  >
                    {/* Year */}
                    <span style={{
                      fontFamily: '"JetBrains Mono", monospace',
                      fontSize: '0.72rem', color: 'rgba(255,255,255,0.28)',
                      letterSpacing: '0.05em', paddingTop: 2,
                    }}>
                      {m.year}
                    </span>

                    {/* Type glyph */}
                    <span style={{ color: meta.color, fontSize: '0.8rem', paddingTop: 2, textAlign: 'center' }}>
                      {meta.glyph}
                    </span>

                    {/* Content */}
                    <div>
                      <div style={{
                        fontFamily: '"JetBrains Mono", monospace',
                        fontSize: '0.68rem', color: meta.color,
                        letterSpacing: '0.1em', marginBottom: 4,
                        textTransform: 'uppercase',
                      }}>
                        [{m.type}] {m.code}
                      </div>
                      <div style={{
                        color: 'rgba(255,255,255,0.75)',
                        fontSize: '0.92rem', lineHeight: 1.55,
                        letterSpacing: '0.01em',
                      }}>
                        {m.label}
                      </div>
                    </div>
                  </div>
                );
              })}

              {/* Blinking cursor at end */}
              <div style={{ padding: '12px 24px', display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  fontFamily: '"JetBrains Mono", monospace',
                  fontSize: '0.75rem', color: 'rgba(255,255,255,0.2)',
                }}>
                  $
                </span>
                <span style={{
                  display: 'inline-block', width: 8, height: 16,
                  background: 'rgba(6,182,212,0.7)',
                  animation: 'termBlink 1.1s step-end infinite',
                }} />
              </div>
            </div>
          </div>

          {/* ── Metric Panels ──────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {METRIC_PANELS.map((m, i) => (
              <div
                key={i}
                className="impact-metric"
                style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: `1px solid rgba(255,255,255,0.06)`,
                  borderLeft: `3px solid ${m.accent}`,
                  borderRadius: 12,
                  padding: '24px 28px',
                  position: 'relative',
                  overflow: 'hidden',
                  opacity: 0,
                  transition: 'border-color 0.3s, background 0.3s',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.background = `${m.accent}08`;
                  (e.currentTarget as HTMLElement).style.borderColor = `${m.accent}30`;
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.02)';
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,0.06)';
                }}
              >
                {/* Ambient corner glow */}
                <div style={{
                  position: 'absolute', top: -20, right: -20,
                  width: 80, height: 80,
                  borderRadius: '50%',
                  background: `radial-gradient(circle, ${m.accent}18, transparent 70%)`,
                  pointerEvents: 'none',
                }} />

                <div style={{
                  fontSize: 'clamp(2rem, 3.5vw, 2.8rem)',
                  fontWeight: 800,
                  color: '#fff',
                  letterSpacing: '-0.03em',
                  lineHeight: 1,
                  marginBottom: 8,
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {m.value}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.85)',
                  fontSize: '0.95rem',
                  fontWeight: 600,
                  marginBottom: 4,
                  letterSpacing: '0.01em',
                }}>
                  {m.label}
                </div>
                <div style={{
                  color: 'rgba(255,255,255,0.35)',
                  fontSize: '0.78rem',
                  letterSpacing: '0.02em',
                }}>
                  {m.sub}
                </div>
              </div>
            ))}

            {/* Legend */}
            <div style={{
              marginTop: 8, padding: '16px 20px',
              background: 'rgba(255,255,255,0.015)',
              border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: 10,
            }}>
              <div style={{
                color: 'rgba(255,255,255,0.3)',
                fontSize: '0.68rem',
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                marginBottom: 12,
                fontFamily: '"JetBrains Mono", monospace',
              }}>
                Log Legend
              </div>
              {Object.entries(TYPE_META).map(([type, meta]) => (
                <div key={type} style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  marginBottom: 8,
                }}>
                  <span style={{ color: meta.color, fontSize: '0.75rem', width: 14, textAlign: 'center' }}>
                    {meta.glyph}
                  </span>
                  <span style={{
                    color: 'rgba(255,255,255,0.4)',
                    fontSize: '0.75rem',
                    letterSpacing: '0.04em',
                    fontFamily: '"JetBrains Mono", monospace',
                  }}>
                    {type}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── Global scoped styles ─────────────────────────────────────────── */}
      <style>{`
        .chronicle-row--visible {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
        @keyframes termBlink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @media (max-width: 860px) {
          .chronicle-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </section>
  );
}
