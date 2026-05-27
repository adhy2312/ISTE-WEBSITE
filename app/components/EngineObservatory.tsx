'use client'

/**
 * ENGINE OBSERVATORY
 * 
 * The MRI scanner of the organism.
 * A hidden developer runtime dashboard — invisible in production to users,
 * always accessible to contributors via keyboard shortcut.
 * 
 * Activation: Press  Ctrl + Shift + O  (O for Observatory)
 * 
 * Displays:
 *  - Live FPS bar graph (last 60 frames)
 *  - Active emotional state + familiarity level
 *  - All 41 engine registration status
 *  - Performance budget & intervention status
 *  - Memory profile (localStorage state)
 *  - Active CSS attributes on <html>
 *  - Scroll velocity real-time
 */

import { useEffect, useRef, useState, useCallback } from 'react'
import { useBrain } from '../brain/BrainProvider'
import { readMemoryProfile } from '../brain/MemoryEngine'

type FPSSample = number

const MAX_FPS_SAMPLES = 60
const OBSERVATORY_KEY = 'iste_observatory_open'

export default function EngineObservatory() {
  const brain = useBrain()
  const [isOpen, setIsOpen] = useState(false)
  const [fpsSamples, setFpsSamples] = useState<FPSSample[]>(Array(MAX_FPS_SAMPLES).fill(60))
  const [htmlAttrs, setHtmlAttrs] = useState<Record<string, string>>({})
  const [memProfile, setMemProfile] = useState<ReturnType<typeof readMemoryProfile> | null>(null)
  const rafRef = useRef<number | null>(null)
  const lastFpsUpdate = useRef(0)
  const mounted = useRef(false)

  // Toggle via Ctrl+Shift+O
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'O') {
        setIsOpen(prev => !prev)
      }
    }
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [])

  // Read memory profile when opened
  useEffect(() => {
    if (isOpen) {
      setMemProfile(readMemoryProfile())
    }
  }, [isOpen])

  // Poll HTML attributes (emotion, familiarity, chrono, motion)
  useEffect(() => {
    if (!isOpen) return
    const poll = () => {
      const root = document.documentElement
      setHtmlAttrs({
        emotion: root.getAttribute('data-emotion') || 'calm',
        familiarity: root.getAttribute('data-familiarity') || 'new',
        chrono: root.getAttribute('data-chrono') || 'peak',
        motion: root.getAttribute('data-motion') || 'moderate',
        visits: root.getAttribute('data-visits') || '0',
        lowPower: root.classList.contains('low-power-mode') ? 'YES ⚠️' : 'no',
      })
    }
    poll()
    const id = setInterval(poll, 500)
    return () => clearInterval(id)
  }, [isOpen])

  // FPS history graph — sample every 250ms when open
  useEffect(() => {
    if (!isOpen) return
    const id = setInterval(() => {
      setFpsSamples(prev => {
        const next = [...prev.slice(1), brain.perfMetrics.fps]
        return next
      })
    }, 250)
    return () => clearInterval(id)
  }, [isOpen, brain.perfMetrics.fps])

  if (!isOpen) {
    return (
      <div
        style={{
          position: 'fixed', bottom: 12, right: 12,
          zIndex: 99999,
          fontSize: '10px', fontFamily: 'monospace',
          color: 'rgba(255,255,255,0.2)',
          cursor: 'pointer',
          userSelect: 'none',
          letterSpacing: '0.1em',
        }}
        onClick={() => setIsOpen(true)}
        title="Open Engine Observatory (Ctrl+Shift+O)"
      >
        ⬡ OBS
      </div>
    )
  }

  const maxFps = Math.max(...fpsSamples, 1)
  const activeCount = brain.activeEngines.size
  const fps = brain.perfMetrics.fps
  const fpsColor = fps >= 50 ? '#4ade80' : fps >= 30 ? '#facc15' : '#f87171'

  return (
    <div style={{
      position: 'fixed',
      bottom: 16, right: 16,
      width: 340,
      maxHeight: '85vh',
      overflowY: 'auto',
      zIndex: 99999,
      background: 'rgba(5, 5, 8, 0.97)',
      border: '1px solid rgba(255,255,255,0.1)',
      borderRadius: 12,
      fontFamily: '"Courier New", monospace',
      fontSize: 11,
      color: 'rgba(255,255,255,0.75)',
      backdropFilter: 'blur(20px)',
      boxShadow: '0 20px 60px rgba(0,0,0,0.8)',
      scrollbarWidth: 'thin',
    }}>
      {/* Header */}
      <div style={{
        padding: '10px 14px',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        position: 'sticky', top: 0,
        background: 'rgba(5,5,8,0.98)',
        borderRadius: '12px 12px 0 0',
      }}>
        <span style={{ color: '#a78bfa', fontWeight: 'bold', letterSpacing: '0.15em', fontSize: 10 }}>
          ⬡ ENGINE OBSERVATORY
        </span>
        <button
          onClick={() => setIsOpen(false)}
          style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.3)', cursor: 'pointer', fontSize: 14 }}
        >✕</button>
      </div>

      <div style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* FPS Monitor */}
        <Section label="PERFORMANCE TELEMETRY">
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 1, height: 40, marginBottom: 6 }}>
            {fpsSamples.map((s, i) => (
              <div key={i} style={{
                flex: 1,
                height: `${(s / maxFps) * 100}%`,
                background: s >= 50 ? '#4ade80' : s >= 30 ? '#facc15' : '#f87171',
                borderRadius: 1,
                opacity: 0.5 + (i / MAX_FPS_SAMPLES) * 0.5,
                minHeight: 1,
              }} />
            ))}
          </div>
          <Row label="FPS" value={<span style={{ color: fpsColor, fontWeight: 'bold' }}>{fps}</span>} />
          <Row label="Intervention" value={brain.perfMetrics.intervention ? '🔴 ACTIVE' : '🟢 clear'} />
          <Row label="Low Power" value={htmlAttrs.lowPower} />
          <Row label="Engines Active" value={`${activeCount} / 41`} />
        </Section>

        {/* Emotional State */}
        <Section label="EMOTIONAL STATE">
          <Row label="Emotion" value={<Pill color={emotionColor(htmlAttrs.emotion)}>{htmlAttrs.emotion || '—'}</Pill>} />
          <Row label="Familiarity" value={<Pill color="#a78bfa">{htmlAttrs.familiarity || '—'}</Pill>} />
          <Row label="Chrono" value={<Pill color={chronoColor(htmlAttrs.chrono)}>{htmlAttrs.chrono || '—'}</Pill>} />
          <Row label="Motion Style" value={htmlAttrs.motion || '—'} />
          <Row label="Visit #" value={htmlAttrs.visits || '0'} />
          <Row label="Scroll Vel" value={brain.scrollVelocityRef.current.toFixed(2)} />
          <Row label="Neural Active" value={brain.soulState.isThinking ? '🧠 thinking' : 'idle'} />
          <Row label="Creative" value={brain.creativeState.immersiveMode ? '🎬 immersive' : `glitch: ${brain.creativeState.glitchIntensity.toFixed(1)}`} />
        </Section>

        {/* Memory Profile */}
        {memProfile && (
          <Section label="MEMORY ENGINE">
            <Row label="Visits" value={memProfile.visitCount} />
            <Row label="Time Spent" value={`${Math.round(memProfile.totalTimeSpent / 60)}min`} />
            <Row label="Sections Seen" value={memProfile.sectionsExplored.length} />
            <Row label="Motion Profile" value={memProfile.motionStyle} />
            <Row label="Familiarity" value={memProfile.familiarity} />
            <Row label="Last Visit" value={
              memProfile.lastVisit
                ? new Date(memProfile.lastVisit).toLocaleDateString()
                : 'first time'
            } />
            <button
              onClick={() => {
                localStorage.removeItem('iste_organism_memory')
                setMemProfile(readMemoryProfile())
                window.location.reload()
              }}
              style={{
                marginTop: 6, padding: '3px 8px', fontSize: 9,
                background: 'rgba(248,113,113,0.1)',
                border: '1px solid rgba(248,113,113,0.3)',
                borderRadius: 4, color: '#f87171', cursor: 'pointer', letterSpacing: '0.1em'
              }}
            >
              RESET MEMORY
            </button>
          </Section>
        )}

        {/* Engine Registry */}
        <Section label={`ENGINE REGISTRY (${activeCount})`}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginTop: 4 }}>
            {Array.from(brain.activeEngines).map(eng => (
              <span key={eng} style={{
                fontSize: 9, padding: '2px 6px',
                background: 'rgba(167,139,250,0.1)',
                border: '1px solid rgba(167,139,250,0.25)',
                borderRadius: 3, color: '#c4b5fd',
                letterSpacing: '0.08em',
              }}>{eng}</span>
            ))}
          </div>
        </Section>

        {/* Shortcut reminder */}
        <div style={{ color: 'rgba(255,255,255,0.15)', fontSize: 9, textAlign: 'center', letterSpacing: '0.1em' }}>
          CTRL+SHIFT+O to toggle · DEBUG BUILD
        </div>
      </div>
    </div>
  )
}

// ── Sub-components ──────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div style={{
        fontSize: 9, letterSpacing: '0.18em', color: 'rgba(255,255,255,0.25)',
        marginBottom: 6, textTransform: 'uppercase',
      }}>{label}</div>
      {children}
    </div>
  )
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '2px 0', borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
      <span style={{ color: 'rgba(255,255,255,0.35)', letterSpacing: '0.08em' }}>{label}</span>
      <span style={{ color: 'rgba(255,255,255,0.8)' }}>{value}</span>
    </div>
  )
}

function Pill({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span style={{
      padding: '1px 7px', borderRadius: 10, fontSize: 10,
      background: `${color}22`, border: `1px solid ${color}55`, color,
    }}>{children}</span>
  )
}

function emotionColor(e: string): string {
  const map: Record<string, string> = {
    calm: '#94a3b8', curious: '#60a5fa', excited: '#f97316',
    thinking: '#a78bfa', dormant: '#475569', stressed: '#f87171',
  }
  return map[e] || '#94a3b8'
}

function chronoColor(c: string): string {
  const map: Record<string, string> = {
    dawn: '#f59e0b', peak: '#f97316', hacker: '#22d3ee',
  }
  return map[c] || '#94a3b8'
}
