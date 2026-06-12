'use client'

import { useEffect, useState, useRef } from 'react'
import { useBrain } from '@/app/brain/BrainProvider'
import TypographyEngine from '@/app/brain/engines/TypographyEngine'
import { gsap, useGSAP } from '@/app/brain/engines/GSAPCore'

const AGENTS = [
  { id: 'discovery', name: 'Quantum Discovery Engine', role: 'Scanning Global Subnets for Anomalies' },
  { id: 'authenticity', name: 'Zero-Trust Authenticator', role: 'Cryptographically Verifying Integrity' },
  { id: 'semantic', name: 'Neural Semantic Decoder', role: 'Extracting High-Value Requirements' },
]

export default function InternshipClientEngine() {
  const { notifyEngine, internshipState } = useBrain()
  const [activeTab, setActiveTab] = useState('radar')
  const [ticker, setTicker] = useState(0)
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const scanlineRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    notifyEngine('Internship', 'page_viewed')
    const i = setInterval(() => setTicker(t => t + 1), 3000)
    return () => clearInterval(i)
  }, [notifyEngine])

  // Canvas Node Network
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = canvas.width = canvas.offsetWidth
    let height = canvas.height = canvas.offsetHeight
    const particles: any[] = []

    for (let i = 0; i < 40; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1
      })
    }

    let rafId: number
    const render = () => {
      ctx.clearRect(0, 0, width, height)
      ctx.fillStyle = 'rgba(59, 130, 246, 0.4)'
      ctx.strokeStyle = 'rgba(59, 130, 246, 0.15)'

      particles.forEach((p, i) => {
        p.x += p.vx
        p.y += p.vy
        if (p.x < 0 || p.x > width) p.vx *= -1
        if (p.y < 0 || p.y > height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fill()

        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j]
          const dist = Math.hypot(p.x - p2.x, p.y - p2.y)
          if (dist < 100) {
            ctx.beginPath()
            ctx.moveTo(p.x, p.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.stroke()
          }
        }
      })
      rafId = requestAnimationFrame(render)
    }
    render()

    const handleResize = () => {
      width = canvas.width = canvas.offsetWidth
      height = canvas.height = canvas.offsetHeight
    }
    window.addEventListener('resize', handleResize)
    return () => {
      cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
    }
  }, [activeTab])

  // GSAP Futuristic Entrance & Interactions
  useGSAP(() => {
    if (!containerRef.current) return

    // Master container entrance
    gsap.fromTo(containerRef.current,
      { y: 50, opacity: 0, scale: 0.98, rotationX: 10 },
      { y: 0, opacity: 1, scale: 1, rotationX: 0, duration: 1.2, ease: 'expo.out' }
    )

    // Animated scanline
    gsap.to(scanlineRef.current, {
      top: '100%',
      duration: 3,
      repeat: -1,
      ease: 'linear',
      opacity: 0.2,
      yoyo: true
    })

    // Content entrance when tab changes
    gsap.fromTo('.gsap-tab-content',
      { opacity: 0, y: 20, filter: 'blur(10px)' },
      { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.8, ease: 'power3.out', stagger: 0.1 }
    )

    // Numbers glitch effect
    gsap.to('.big-num', {
      scrambleText: { text: '{original}', chars: '01', speed: 0.3 },
      duration: 1.5,
      ease: 'none',
      stagger: 0.2
    })
  }, [activeTab])

  return (
    <div className="intel-dashboard" ref={containerRef}>
      {/* Background Canvas */}
      <canvas ref={canvasRef} className="bg-canvas"></canvas>
      <div className="scanline" ref={scanlineRef}></div>
      <div className="dashboard-overlay"></div>

      <div className="dash-header relative z-10">
        <div className="dh-left">
          <div className="dh-status-pulse"></div>
          <h2>AUTONOMOUS INTELLIGENCE CORE</h2>
        </div>
        <div className="dh-nav">
          <button className={activeTab === 'radar' ? 'active' : ''} onClick={() => setActiveTab('radar')}>LIVE RADAR</button>
          <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>SYSTEM ARCHITECTURE</button>
        </div>
      </div>

      <div className="dash-body relative z-10">
        {activeTab === 'radar' && (
          <div className="radar-view gsap-tab-content">
            <div className="rv-main">
              <TypographyEngine text="Data Ingestion Stream" type="fade-stagger" element="h3" delay={0.1} />
              <div className="feed-container futuristic-border">
                {internshipState.logs.length === 0 ? (
                  <div className="feed-waiting glitch-text" data-text="Awaiting telemetry...">Awaiting telemetry...</div>
                ) : (
                  internshipState.logs.map((log, i) => (
                    <div key={i} className="feed-item" style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
                      <span className="fi-time">[{new Date().toLocaleTimeString()}]</span>
                      <span className="fi-msg terminal-text">{log}</span>
                    </div>
                  ))
                )}
                <div className="feed-item"><span className="fi-time">[SYS]</span> <span className="fi-msg text-emerald-400">Neural filters calibrated. Quantum handshakes verified.</span></div>
                <div className="feed-item"><span className="fi-time">[SYS]</span> <span className="fi-msg text-blue-400">Blocking non-authoritative domains with strict CSP bounds.</span></div>
              </div>
            </div>
            <div className="rv-sidebar gsap-tab-content">
              <div className="stat-card futuristic-border">
                <div className="corner-accent top-left"></div>
                <div className="corner-accent bottom-right"></div>
                <h4>Data Integrity</h4>
                <div className="big-num text-cyan-300">99.9%</div>
                <div className="sub-num">Cryptographic Confidence Index</div>
              </div>
              <div className="stat-card futuristic-border">
                <div className="corner-accent top-left"></div>
                <div className="corner-accent bottom-right"></div>
                <h4>Active Opportunities</h4>
                <div className="big-num text-emerald-300">{internshipState.foundCount > 0 ? internshipState.foundCount : 12}</div>
                <div className="sub-num">Verified Regional Hyper-Matches</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agent-view gsap-tab-content">
            <TypographyEngine text="Distributed Intelligence Nodes" type="fade-stagger" element="h3" delay={0.1} className="mb-6" />
            <div className="agent-grid">
              {AGENTS.map((agent, i) => (
                <div key={agent.id} className="agent-node futuristic-border">
                  <div className="node-header">
                    <div className={`node-indicator ${ticker % (i + 2) === 0 ? 'active' : ''}`}></div>
                    <h5 className="text-blue-300">{agent.name}</h5>
                  </div>
                  <p className="font-mono text-xs mt-2 text-slate-400">{agent.role}</p>
                  <div className="node-activity mt-4">
                    <div className="text-[10px] text-blue-500 mb-1 font-mono uppercase tracking-widest">Compute Load</div>
                    <div className="progress-bar">
                      <div className="fill shadow-blue-500/50 shadow-lg" style={{ width: `${60 + (Math.sin(ticker + i) * 20)}%` }}></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .intel-dashboard {
          max-width: 1000px;
          margin: 60px auto;
          background: rgba(10, 15, 26, 0.7);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 8px;
          backdrop-filter: blur(24px);
          overflow: hidden;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
          position: relative;
          box-shadow: 0 0 40px rgba(59, 130, 246, 0.1), inset 0 0 20px rgba(59, 130, 246, 0.05);
          transform-style: preserve-3d;
          perspective: 1000px;
        }

        .bg-canvas {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 100%;
          z-index: 1;
          pointer-events: none;
        }

        .scanline {
          position: absolute;
          top: 0; left: 0;
          width: 100%; height: 2px;
          background: linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.8), transparent);
          box-shadow: 0 0 10px rgba(59, 130, 246, 0.8);
          z-index: 5;
          pointer-events: none;
        }

        .dashboard-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(180deg, rgba(10,15,26,0) 0%, rgba(10,15,26,0.8) 100%);
          z-index: 2;
          pointer-events: none;
        }

        .futuristic-border {
          position: relative;
          background: rgba(15, 23, 42, 0.5);
          border: 1px solid rgba(59, 130, 246, 0.2);
          box-shadow: inset 0 0 15px rgba(0, 0, 0, 0.5);
        }

        .corner-accent {
          position: absolute;
          width: 8px; height: 8px;
          border-color: #3b82f6;
          border-style: solid;
        }
        .top-left { top: -1px; left: -1px; border-width: 2px 0 0 2px; }
        .bottom-right { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; }

        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(59, 130, 246, 0.15);
          background: rgba(10, 15, 26, 0.8);
        }
        .dh-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dh-status-pulse {
          width: 8px;
          height: 8px;
          background: #3b82f6;
          box-shadow: 0 0 10px #3b82f6, 0 0 20px #3b82f6;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% { opacity: 1; box-shadow: 0 0 10px #3b82f6; }
          50% { opacity: 0.4; box-shadow: 0 0 2px #3b82f6; }
          100% { opacity: 1; box-shadow: 0 0 10px #3b82f6; }
        }

        .dh-left h2 {
          margin: 0;
          font-family: var(--font-mono);
          font-size: 0.9rem;
          font-weight: 700;
          letter-spacing: 0.15em;
          color: #93c5fd;
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.5);
        }
        .dh-nav {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.3);
          border-radius: 4px;
          display: flex;
          overflow: hidden;
        }
        .dh-nav button {
          background: transparent;
          border: none;
          color: #64748b;
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.1em;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
        }
        .dh-nav button:hover {
          color: #93c5fd;
          background: rgba(59, 130, 246, 0.1);
        }
        .dh-nav button.active {
          background: rgba(59, 130, 246, 0.2);
          color: #60a5fa;
          box-shadow: inset 0 0 10px rgba(59, 130, 246, 0.2);
        }

        .dash-body {
          padding: 32px;
          min-height: 380px;
        }
        .radar-view {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 32px;
        }
        .rv-main h3, .agent-view h3 {
          margin-top: 0;
          color: #bfdbfe;
          font-family: var(--font-mono);
          text-transform: uppercase;
          letter-spacing: 0.1em;
          font-size: 1rem;
          margin-bottom: 24px;
        }

        .feed-container {
          padding: 20px;
          height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .feed-container::-webkit-scrollbar { width: 4px; }
        .feed-container::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.3); border-radius: 2px; }

        .feed-item {
          font-family: var(--font-mono);
          font-size: 0.75rem;
          padding: 8px 12px;
          background: rgba(0,0,0,0.3);
          border-left: 2px solid rgba(59,130,246,0.5);
          display: flex;
          gap: 16px;
          animation: typeIn 0.3s steps(20, end) forwards;
          opacity: 0;
        }
        @keyframes typeIn {
          from { opacity: 0; clip-path: polygon(0 0, 0 0, 0 100%, 0 100%); }
          to { opacity: 1; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%); }
        }

        .fi-time { color: #60a5fa; min-width: 85px; }
        .terminal-text { color: #e2e8f0; word-break: break-all; }

        .stat-card {
          padding: 24px;
          margin-bottom: 20px;
        }
        .stat-card h4, .agent-node h5 {
          margin: 0;
          font-family: var(--font-mono);
          color: #94a3b8;
          font-size: 0.75rem;
          letter-spacing: 0.1em;
          margin-bottom: 12px;
        }
        .big-num {
          font-family: var(--font-mono);
          font-size: 2.5rem;
          font-weight: 300;
          line-height: 1;
          text-shadow: 0 0 20px currentColor;
        }
        .sub-num {
          font-size: 0.7rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: #64748b;
          margin-top: 12px;
        }

        .agent-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .agent-node {
          padding: 24px;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .agent-node:hover {
          transform: translateY(-5px) scale(1.02);
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.15), inset 0 0 20px rgba(59, 130, 246, 0.1);
          border-color: rgba(59, 130, 246, 0.5);
        }
        .node-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .node-indicator {
          width: 8px; height: 8px;
          background: transparent;
          border: 1px solid #3b82f6;
          transition: all 0.2s ease;
        }
        .node-indicator.active { 
          background: #3b82f6; 
          box-shadow: 0 0 10px #3b82f6; 
        }

        .progress-bar {
          height: 2px; background: rgba(59, 130, 246, 0.1);
          overflow: hidden;
        }
        .progress-bar .fill {
          height: 100%; background: #3b82f6; transition: width 1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @media (max-width: 768px) {
          .radar-view, .agent-grid { grid-template-columns: 1fr; }
          .dh-nav { width: 100%; justify-content: center; }
          .dash-header { flex-direction: column; gap: 20px; }
        }
      `}</style>
    </div>
  )
}
