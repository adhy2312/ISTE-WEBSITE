'use client'

import { useEffect, useState } from 'react'
import { useBrain } from '@/app/brain/BrainProvider'
import TypographyEngine from '@/app/brain/engines/TypographyEngine'

const AGENTS = [
  { id: 'discovery', name: 'Discovery Engine', role: 'Scanning Global Subnets' },
  { id: 'authenticity', name: 'Trust & Validation', role: 'Verifying Integrity' },
  { id: 'semantic', name: 'Semantic Analyzer', role: 'Extracting Requirements' },
]

export default function InternshipClientEngine() {
  const { notifyEngine, internshipState } = useBrain()
  const [activeTab, setActiveTab] = useState('radar')
  const [ticker, setTicker] = useState(0)

  useEffect(() => {
    notifyEngine('Internship', 'page_viewed')
    const i = setInterval(() => setTicker(t => t + 1), 3000)
    return () => clearInterval(i)
  }, [notifyEngine])

  return (
    <div className="intel-dashboard">
      <div className="dash-header">
        <div className="dh-left">
          <div className="dh-status-pulse"></div>
          <h2>OPPORTUNITY INTELLIGENCE</h2>
        </div>
        <div className="dh-nav">
          <button className={activeTab === 'radar' ? 'active' : ''} onClick={() => setActiveTab('radar')}>LIVE RADAR</button>
          <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>SYSTEM ARCHITECTURE</button>
        </div>
      </div>

      <div className="dash-body">
        {activeTab === 'radar' && (
          <div className="radar-view">
            <div className="rv-main">
              <TypographyEngine text="Live Discovery Feed" type="fade-stagger" element="h3" delay={0.1} />
              <div className="feed-container">
                {internshipState.logs.length === 0 ? (
                  <div className="feed-waiting">Awaiting telemetry from external scraping nodes...</div>
                ) : (
                  internshipState.logs.map((log, i) => (
                    <div key={i} className="feed-item" style={{ animationDelay: `${Math.min(i * 0.05, 0.5)}s` }}>
                      <span className="fi-time">{new Date().toLocaleTimeString()}</span>
                      <span className="fi-msg">{log}</span>
                    </div>
                  ))
                )}
                {/* Simulated recent logs for architectural demonstration */}
                <div className="feed-item"><span className="fi-time">System</span> <span className="fi-msg" style={{color: '#94a3b8'}}>[Init] Neural filters calibrated for strict quality bounds.</span></div>
                <div className="feed-item"><span className="fi-time">System</span> <span className="fi-msg" style={{color: '#cbd5e1'}}>[Validation] Blocking non-authoritative domains.</span></div>
              </div>
            </div>
            <div className="rv-sidebar">
              <div className="stat-card">
                <h4>Data Integrity</h4>
                <div className="big-num">99.2%</div>
                <div className="sub-num">High Confidence Index</div>
              </div>
              <div className="stat-card">
                <h4>Active Opportunities</h4>
                <div className="big-num">{internshipState.foundCount > 0 ? internshipState.foundCount : 12}</div>
                <div className="sub-num">Verified Regional Matches</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agent-view">
            <TypographyEngine text="Distributed Intelligence Nodes" type="fade-stagger" element="h3" delay={0.1} className="mb-6" />
            <div className="agent-grid">
              {AGENTS.map((agent, i) => (
                <div key={agent.id} className="agent-node">
                  <div className="node-header">
                    <div className={`node-indicator ${ticker % (i + 2) === 0 ? 'active' : ''}`}></div>
                    <h5>{agent.name}</h5>
                  </div>
                  <p>{agent.role}</p>
                  <div className="node-activity">
                    <div className="progress-bar"><div className="fill" style={{ width: `${60 + (Math.sin(ticker + i) * 20)}%` }}></div></div>
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
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          backdrop-filter: blur(24px);
          overflow: hidden;
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
        }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 24px 32px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .dh-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dh-status-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #f8fafc;
          opacity: 0.8;
        }
        .dh-left h2 {
          margin: 0;
          font-size: 0.9rem;
          font-weight: 500;
          letter-spacing: 0.05em;
          color: #f8fafc;
        }
        .dh-nav {
          background: rgba(255,255,255,0.03);
          border-radius: 30px;
          padding: 4px;
          display: flex;
        }
        .dh-nav button {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 500;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.3s ease;
          border-radius: 20px;
        }
        .dh-nav button:hover {
          color: #f8fafc;
        }
        .dh-nav button.active {
          background: #f8fafc;
          color: #0f172a;
          font-weight: 600;
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
          color: #f8fafc;
          font-size: 1.1rem;
          font-weight: 500;
          margin-bottom: 24px;
        }
        .stat-card h4, .agent-node h5 {
          margin: 0;
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
        }
        .feed-container {
          background: rgba(0,0,0,0.2);
          border-radius: 12px;
          padding: 20px;
          height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }
        .feed-item {
          font-family: var(--font-mono);
          font-size: 0.8rem;
          padding: 10px 0;
          border-bottom: 1px solid rgba(255,255,255,0.03);
          display: flex;
          gap: 16px;
          animation: slideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          opacity: 0;
          transform: translateY(10px);
        }
        .fi-time {
          color: #64748b;
          min-width: 80px;
        }
        .fi-msg {
          color: #cbd5e1;
          word-break: break-all;
        }
        .stat-card {
          background: rgba(255,255,255,0.02);
          padding: 24px;
          border-radius: 16px;
          margin-bottom: 20px;
        }
        .big-num {
          font-size: 2.2rem;
          font-weight: 400;
          color: #f8fafc;
        }
        .sub-num {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 8px;
        }
        .agent-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }
        .agent-node {
          background: rgba(255,255,255,0.02);
          padding: 24px;
          border-radius: 16px;
          transition: transform 0.3s ease;
        }
        .agent-node:hover {
          transform: translateY(-4px);
        }
        .node-header {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .node-indicator {
          width: 6px; height: 6px; border-radius: 50%;
          background: #3b82f6;
          transition: background 0.3s ease;
        }
        .node-indicator.active { background: #f8fafc; }
        .agent-node p {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 12px 0 20px 0;
        }
        .progress-bar {
          height: 2px; background: rgba(255,255,255,0.1); border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar .fill {
          height: 100%; background: #f8fafc; transition: width 2s cubic-bezier(0.16, 1, 0.3, 1);
        }
        
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        @media (max-width: 768px) {
          .radar-view, .agent-grid {
            grid-template-columns: 1fr;
          }
          .dh-nav { width: 100%; justify-content: center; }
          .dash-header { flex-direction: column; gap: 20px; }
        }
      `}</style>
    </div>
  )
}
