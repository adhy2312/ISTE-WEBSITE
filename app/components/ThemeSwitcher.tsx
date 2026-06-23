'use client';

import { useEffect, useState } from 'react';

type ChronoTheme = 'dawn' | 'peak' | 'hacker';

const THEME_CONFIG: Record<ChronoTheme, { label: string; icon: string; desc: string; accent: string }> = {
  dawn: {
    label: 'Dawn',
    icon: '🌅',
    desc: 'Warm amber — 6AM to Noon',
    accent: '#f59e0b',
  },
  peak: {
    label: 'Zenith',
    icon: '☀️',
    desc: 'Cool blue — Noon to 6PM',
    accent: '#3b82f6',
  },
  hacker: {
    label: 'Hacker',
    icon: '🌙',
    desc: 'Terminal green — 6PM to 6AM',
    accent: '#4ade80',
  },
};

export default function ThemeSwitcher() {
  const [current, setCurrent] = useState<ChronoTheme>('hacker');
  const [open, setOpen] = useState(false);
  const [isManual, setIsManual] = useState(false);

  // Read current theme from document attribute
  useEffect(() => {
    const detect = () => {
      const attr = document.documentElement.getAttribute('data-chrono') as ChronoTheme | null;
      if (attr && !isManual) setCurrent(attr || 'hacker');
    };
    detect();
    const observer = new MutationObserver(detect);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-chrono'] });
    return () => observer.disconnect();
  }, [isManual]);

  const setTheme = (theme: ChronoTheme) => {
    document.documentElement.setAttribute('data-chrono', theme);
    setCurrent(theme);
    setIsManual(true);
    setOpen(false);
    // Persist for the session
    try { sessionStorage.setItem('chrono-override', theme); } catch {}
  };

  const config = THEME_CONFIG[current];

  return (
    <div className="theme-switcher" style={{ position: 'fixed', bottom: '24px', right: '24px', zIndex: 9000 }}>
      {/* Panel */}
      {open && (
        <div className="ts-panel">
          <div className="ts-header">
            <span className="ts-title">Chrono Theme</span>
            {isManual && (
              <button
                className="ts-auto-btn"
                onClick={() => {
                  setIsManual(false);
                  try { sessionStorage.removeItem('chrono-override'); } catch {}
                  // Restore IST-based theme
                  const hours = new Date().getHours();
                  const auto: ChronoTheme = hours >= 6 && hours < 12 ? 'dawn' : hours >= 12 && hours < 18 ? 'peak' : 'hacker';
                  setTheme(auto);
                }}
              >
                Auto
              </button>
            )}
          </div>
          {(Object.keys(THEME_CONFIG) as ChronoTheme[]).map(theme => {
            const t = THEME_CONFIG[theme];
            return (
              <button
                key={theme}
                className={`ts-option ${current === theme ? 'active' : ''}`}
                onClick={() => setTheme(theme)}
                style={{ '--accent': t.accent } as React.CSSProperties}
              >
                <span className="ts-icon">{t.icon}</span>
                <div className="ts-info">
                  <div className="ts-name">{t.label}</div>
                  <div className="ts-desc">{t.desc}</div>
                </div>
                {current === theme && <span className="ts-check">✓</span>}
              </button>
            );
          })}
        </div>
      )}

      {/* Trigger */}
      <button
        className="ts-trigger"
        onClick={() => setOpen(o => !o)}
        aria-label="Toggle theme switcher"
        style={{ '--accent': config.accent } as React.CSSProperties}
      >
        <span className="ts-trigger-icon">{config.icon}</span>
      </button>

      <style>{`
        .ts-trigger {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: rgba(10, 15, 26, 0.85);
          border: 1px solid var(--accent, rgba(255,255,255,0.15));
          box-shadow: 0 0 16px color-mix(in srgb, var(--accent, transparent) 30%, transparent);
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 1.2rem;
          transition: all 0.25s;
          backdrop-filter: blur(12px);
        }
        .ts-trigger:hover {
          transform: scale(1.1);
          box-shadow: 0 0 24px color-mix(in srgb, var(--accent, transparent) 50%, transparent);
        }
        .ts-trigger-icon { line-height: 1; }

        .ts-panel {
          position: absolute; bottom: 54px; right: 0;
          width: 230px;
          background: rgba(8, 12, 20, 0.95);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          overflow: hidden;
          backdrop-filter: blur(20px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6);
          animation: panelIn 0.2s ease;
        }
        @keyframes panelIn {
          from { opacity: 0; transform: translateY(8px) scale(0.96); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        .ts-header {
          padding: 12px 16px 8px;
          display: flex; align-items: center; justify-content: space-between;
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .ts-title {
          font-family: var(--font-mono);
          font-size: 0.65rem; letter-spacing: 0.12em;
          text-transform: uppercase; color: rgba(255,255,255,0.4);
        }
        .ts-auto-btn {
          font-size: 0.65rem; font-family: var(--font-mono);
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: rgba(255,255,255,0.5); padding: 2px 8px;
          border-radius: 6px; cursor: pointer;
          transition: all 0.15s; letter-spacing: 0.06em;
        }
        .ts-auto-btn:hover { background: rgba(255,255,255,0.1); color: rgba(255,255,255,0.8); }

        .ts-option {
          width: 100%; padding: 12px 16px;
          background: none; border: none; cursor: pointer;
          display: flex; align-items: center; gap: 12px;
          transition: background 0.15s; text-align: left;
        }
        .ts-option:hover { background: rgba(255,255,255,0.04); }
        .ts-option.active { background: rgba(255,255,255,0.06); }
        .ts-icon { font-size: 1.1rem; flex-shrink: 0; }
        .ts-info { flex: 1; }
        .ts-name {
          font-size: 0.85rem; font-weight: 600; color: rgba(255,255,255,0.9);
          margin-bottom: 2px;
        }
        .ts-desc {
          font-size: 0.68rem; color: rgba(255,255,255,0.35);
          font-family: var(--font-mono);
        }
        .ts-check {
          font-size: 0.75rem; color: var(--accent, #60a5fa);
          flex-shrink: 0;
        }
      `}</style>
    </div>
  );
}
