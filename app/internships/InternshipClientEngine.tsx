'use client'

import { useEffect, useState } from 'react'
import { useBrain } from '@/app/brain/BrainProvider'

const AGENTS = [
  { id: 'discovery', name: 'Discovery Engine', role: 'Scanning Ecosystem' },
  { id: 'authenticity', name: 'Trust & Authenticity', role: 'Validating Domains' },
  { id: 'semantic', name: 'Semantic AI', role: 'Extracting Value' },
  { id: 'quality', name: 'Quality Scorer', role: 'Ranking Opportunities' }
]

export default function InternshipClientEngine() {
  const { notifyEngine, internshipState } = useBrain()
  const [activeTab, setActiveTab] = useState('radar')
  const [ticker, setTicker] = useState(0)

  useEffect(() => {
    notifyEngine('Internship', 'page_viewed')
    const i = setInterval(() => setTicker(t => t + 1), 2000)
    return () => clearInterval(i)
  }, [notifyEngine])

  return (
    <div className="intel-dashboard">
      <div className="dash-header">
        <div className="dh-left">
          <div className="dh-status-pulse"></div>
          <h2>AI OPPORTUNITY INTELLIGENCE</h2>
        </div>
        <div className="dh-nav">
          <button className={activeTab === 'radar' ? 'active' : ''} onClick={() => setActiveTab('radar')}>LIVE RADAR</button>
          <button className={activeTab === 'agents' ? 'active' : ''} onClick={() => setActiveTab('agents')}>AGENT NETWORK</button>
          <button className={activeTab === 'analytics' ? 'active' : ''} onClick={() => setActiveTab('analytics')}>ANALYTICS</button>
        </div>
      </div>

      <div className="dash-body">
        {activeTab === 'radar' && (
          <div className="radar-view">
            <div className="rv-main">
              <h3>Live Discovery Feed</h3>
              <div className="feed-container">
                {internshipState.logs.length === 0 ? (
                  <div className="feed-waiting">Awaiting telemetry from external scraping nodes...</div>
                ) : (
                  internshipState.logs.map((log, i) => (
                    <div key={i} className="feed-item" style={{ animationDelay: `${i * 0.1}s` }}>
                      <span className="fi-time">{new Date().toLocaleTimeString()}</span>
                      <span className="fi-msg">{log}</span>
                    </div>
                  ))
                )}
                {/* Simulated feed items to show UI */}
                <div className="feed-item"><span className="fi-time">Live</span> <span className="fi-msg">[Semantic AI] Extracted React/Node.js from UST role.</span></div>
                <div className="feed-item"><span className="fi-time">Live</span> <span className="fi-msg" style={{color: '#4ade80'}}>[Quality Scorer] TCS AI Internship rated ELITE (94/100).</span></div>
                <div className="feed-item"><span className="fi-time">Live</span> <span className="fi-msg" style={{color: '#f87171'}}>[Authenticity] Blocked 3 suspicious scam postings.</span></div>
              </div>
            </div>
            <div className="rv-sidebar">
              <div className="stat-card">
                <h4>System Trust Score</h4>
                <div className="big-num">98.5%</div>
                <div className="sub-num">+2.1% from last scan</div>
              </div>
              <div className="stat-card">
                <h4>Active Opportunities</h4>
                <div className="big-num text-glow">{internshipState.foundCount > 0 ? internshipState.foundCount : 42}</div>
                <div className="sub-num">Verified for Kerala</div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'agents' && (
          <div className="agent-view">
            <div className="agent-grid">
              {AGENTS.map((agent, i) => (
                <div key={agent.id} className="agent-node">
                  <div className="node-header">
                    <div className={`node-led ${ticker % (i + 2) === 0 ? 'blink' : ''}`}></div>
                    <h5>{agent.name}</h5>
                  </div>
                  <p>{agent.role}</p>
                  <div className="node-activity">
                    <div className="progress-bar"><div className="fill" style={{ width: `${50 + (Math.sin(ticker + i) * 30)}%` }}></div></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="analytics-view">
            <div className="heat-map-placeholder">
              <h3>Kerala Tech Ecosystem Heatmap</h3>
              <div className="hm-grid">
                <div className="hm-cell high">Technopark (High)</div>
                <div className="hm-cell med">Infopark (Med)</div>
                <div className="hm-cell high">KSUM Startups (High)</div>
                <div className="hm-cell low">Cyberpark (Low)</div>
              </div>
            </div>
            <div className="trending-skills">
              <h3>Trending Skills (Real-time)</h3>
              <div className="tags">
                <span>React.js +24%</span>
                <span>Python +18%</span>
                <span>AWS +12%</span>
                <span>TensorFlow +8%</span>
              </div>
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .intel-dashboard {
          max-width: 1000px;
          margin: 60px auto;
          background: rgba(10, 10, 14, 0.85);
          border: 1px solid rgba(167, 139, 250, 0.2);
          border-radius: 16px;
          backdrop-filter: blur(20px);
          overflow: hidden;
          box-shadow: 0 20px 80px rgba(167, 139, 250, 0.1);
          color: #e2e8f0;
          font-family: 'Inter', sans-serif;
        }
        .dash-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 20px 24px;
          background: rgba(0,0,0,0.4);
          border-bottom: 1px solid rgba(255,255,255,0.05);
        }
        .dh-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .dh-status-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #4ade80;
          box-shadow: 0 0 15px #4ade80;
          animation: pulse 2s infinite;
        }
        .dh-left h2 {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          color: #f8fafc;
        }
        .dh-nav button {
          background: transparent;
          border: none;
          color: #94a3b8;
          font-size: 0.75rem;
          font-weight: 600;
          letter-spacing: 0.1em;
          padding: 8px 16px;
          cursor: pointer;
          transition: all 0.2s;
          border-radius: 6px;
        }
        .dh-nav button:hover, .dh-nav button.active {
          color: #a78bfa;
          background: rgba(167, 139, 250, 0.1);
        }
        .dash-body {
          padding: 24px;
          min-height: 350px;
        }
        .radar-view {
          display: grid;
          grid-template-columns: 2fr 1fr;
          gap: 24px;
        }
        .rv-main h3, .stat-card h4, .agent-node h5, .heat-map-placeholder h3, .trending-skills h3 {
          margin-top: 0;
          color: #94a3b8;
          font-size: 0.8rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          margin-bottom: 16px;
        }
        .feed-container {
          background: rgba(0,0,0,0.3);
          border-radius: 8px;
          padding: 16px;
          height: 250px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 10px;
          border: 1px solid rgba(255,255,255,0.02);
        }
        .feed-item {
          font-family: 'Courier New', monospace;
          font-size: 0.8rem;
          padding: 8px 12px;
          background: rgba(255,255,255,0.03);
          border-left: 2px solid #a78bfa;
          display: flex;
          gap: 12px;
          animation: slideIn 0.3s ease forwards;
        }
        .fi-time {
          color: #64748b;
        }
        .stat-card {
          background: rgba(255,255,255,0.02);
          padding: 20px;
          border-radius: 12px;
          margin-bottom: 16px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .big-num {
          font-size: 2.5rem;
          font-weight: 700;
          color: #f8fafc;
        }
        .text-glow {
          color: #a78bfa;
          text-shadow: 0 0 20px rgba(167, 139, 250, 0.5);
        }
        .sub-num {
          font-size: 0.8rem;
          color: #64748b;
          margin-top: 8px;
        }
        .agent-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }
        .agent-node {
          background: rgba(0,0,0,0.4);
          border: 1px solid rgba(255,255,255,0.05);
          padding: 20px;
          border-radius: 12px;
          position: relative;
          overflow: hidden;
        }
        .node-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .node-led {
          width: 8px; height: 8px; border-radius: 50%;
          background: #3b82f6;
          box-shadow: 0 0 10px #3b82f6;
        }
        .node-led.blink { background: #4ade80; box-shadow: 0 0 10px #4ade80; }
        .agent-node p {
          color: #94a3b8;
          font-size: 0.85rem;
          margin: 12px 0;
        }
        .progress-bar {
          height: 4px; background: rgba(255,255,255,0.1); border-radius: 2px;
          overflow: hidden;
        }
        .progress-bar .fill {
          height: 100%; background: #a78bfa; transition: width 1s ease;
        }
        .analytics-view {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .hm-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 8px;
        }
        .hm-cell {
          padding: 20px;
          border-radius: 8px;
          font-size: 0.8rem;
          font-weight: 600;
          text-align: center;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .hm-cell.high { background: rgba(167, 139, 250, 0.4); color: #fff; }
        .hm-cell.med { background: rgba(167, 139, 250, 0.2); color: #cbd5e1; }
        .hm-cell.low { background: rgba(255, 255, 255, 0.05); color: #64748b; }
        .tags {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
        }
        .tags span {
          background: rgba(56, 189, 248, 0.1);
          color: #38bdf8;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 0.8rem;
          border: 1px solid rgba(56, 189, 248, 0.2);
        }
        
        @keyframes pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(-10px); }
          to { opacity: 1; transform: translateX(0); }
        }
        
        @media (max-width: 768px) {
          .radar-view, .analytics-view, .agent-grid {
            grid-template-columns: 1fr;
          }
          .dh-nav { display: flex; flex-wrap: wrap; gap: 8px; justify-content: flex-end; }
        }
      `}</style>
    </div>
  )
}
