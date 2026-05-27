'use client'

import { useEffect, useRef } from 'react'
import { useBrain } from '@/app/brain/BrainProvider'

export default function InternshipClientEngine() {
  const { notifyEngine, internshipState } = useBrain()

  useEffect(() => {
    // Notify brain that user entered the internship launchpad
    notifyEngine('Internship', 'page_viewed')
    notifyEngine('Neural', 'processing') // trigger neural hum
    
    const timeout = setTimeout(() => {
      notifyEngine('Neural', 'idle')
    }, 1500)

    return () => {
      clearTimeout(timeout)
      notifyEngine('Neural', 'idle')
    }
  }, [notifyEngine])

  return (
    <div className="internship-engine-panel">
      <div className="ie-header">
        <div className="ie-header-left">
          <div className="ie-pulse"></div>
          <span className="ie-label">Internship AI Agent [Active]</span>
        </div>
        <div className="ie-status">
          Status: {internshipState.agentStatus}
        </div>
      </div>
      
      <div className="ie-logs-container">
        <div className="ie-logs-inner">
          {internshipState.logs.slice(0, 8).map((log, i) => (
            <div 
              key={i} 
              className="ie-log-line"
              style={{ 
                opacity: 1 - (i * 0.15),
                transform: `scale(${1 - (i * 0.02)}) translateY(-${i * 2}px)`,
                color: log.includes('[FOUND]') ? 'rgba(var(--c-main), 1)' : 'inherit'
              }}
            >
              {log}
            </div>
          ))}
          {internshipState.logs.length === 0 && (
            <div className="ie-waiting">Waiting for agent telemetry...</div>
          )}
        </div>
      </div>
      
      <div className="ie-footer">
        <span className="ie-sector">Sector: Kerala Hubs</span>
        <span className="ie-count">Opportunities Extracted: {internshipState.foundCount}</span>
      </div>

      <style jsx>{`
        .internship-engine-panel {
          max-width: 56rem;
          margin: 48px auto 0;
          border-radius: 16px;
          border: 1px solid rgba(var(--c-main), 0.15);
          background: rgba(18, 18, 20, 0.8);
          padding: 24px;
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          box-shadow: 0 0 40px rgba(var(--c-main), 0.05);
          position: relative;
          z-index: 3;
        }
        .ie-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
          padding-bottom: 16px;
          margin-bottom: 16px;
        }
        .ie-header-left {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .ie-pulse {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: rgba(var(--c-main), 1);
          box-shadow: 0 0 10px rgba(var(--c-main), 0.8);
          animation: iePulse 2s ease-in-out infinite;
        }
        @keyframes iePulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }
        .ie-label {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.15em;
          color: rgba(var(--c-main), 1);
        }
        .ie-status {
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          color: var(--g400);
          letter-spacing: 0.15em;
        }
        .ie-logs-container {
          position: relative;
          height: 120px;
          width: 100%;
          overflow: hidden;
          font-family: var(--font-mono);
          font-size: 10px;
          letter-spacing: 0.05em;
          color: var(--g400);
          mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
          -webkit-mask-image: linear-gradient(to bottom, transparent, black 10%, black 90%, transparent);
        }
        .ie-logs-inner {
          position: absolute;
          bottom: 0;
          left: 0;
          width: 100%;
          display: flex;
          flex-direction: column-reverse;
          justify-content: flex-start;
        }
        .ie-log-line {
          padding: 4px 0;
          transition: all 0.3s;
        }
        .ie-waiting {
          color: var(--g600);
          animation: iePulse 2s ease-in-out infinite;
        }
        .ie-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid rgba(255, 255, 255, 0.06);
          padding-top: 16px;
          margin-top: 16px;
          font-family: var(--font-mono);
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.15em;
        }
        .ie-sector {
          color: var(--g400);
        }
        .ie-count {
          color: rgba(var(--c-main), 1);
        }
        @media (max-width: 768px) {
          .internship-engine-panel {
            margin: 24px 16px 0;
            padding: 16px;
          }
          .ie-header {
            flex-direction: column;
            gap: 8px;
            align-items: flex-start;
          }
        }
      `}</style>
    </div>
  )
}
