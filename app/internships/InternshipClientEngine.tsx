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
    <div className="mx-auto mt-12 max-w-4xl rounded-xl border border-[var(--c-main)]/20 bg-[var(--g800)]/80 p-6 backdrop-blur-md shadow-[0_0_40px_rgba(213,244,249,0.05)]">
      <div className="mb-4 flex items-center justify-between border-b border-[var(--border)] pb-4">
        <div className="flex items-center gap-3">
          <div className="h-2 w-2 animate-pulse rounded-full bg-[var(--c-main)] shadow-[0_0_10px_var(--c-main)]"></div>
          <span className="font-mono text-xs font-bold uppercase tracking-widest text-[var(--c-main)]">Internship AI Agent [Active]</span>
        </div>
        <div className="font-mono text-[10px] uppercase text-[var(--g400)] tracking-widest">
          Status: {internshipState.agentStatus}
        </div>
      </div>
      
      <div className="relative h-[120px] w-full overflow-hidden font-mono text-[10px] tracking-wider text-[var(--c-alt1)] mask-image-[linear-gradient(to_bottom,transparent,black_10%,black_90%,transparent)]">
        <div className="absolute bottom-0 left-0 flex w-full flex-col-reverse justify-start">
          {internshipState.logs.slice(0, 8).map((log, i) => (
            <div 
              key={i} 
              className="py-1 opacity-100 transition-all duration-300"
              style={{ 
                opacity: 1 - (i * 0.15),
                transform: `scale(${1 - (i * 0.02)}) translateY(-${i * 2}px)`,
                color: log.includes('[FOUND]') ? 'var(--c-main)' : 'inherit'
              }}
            >
              {log}
            </div>
          ))}
          {internshipState.logs.length === 0 && (
            <div className="animate-pulse text-[var(--g400)]">Waiting for agent telemetry...</div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex items-center justify-between border-t border-[var(--border)] pt-4 font-mono text-[10px] uppercase tracking-widest">
        <span className="text-[var(--g400)]">Sector: Kerala Hubs</span>
        <span className="text-[var(--c-main)]">Opportunities Extracted: {internshipState.foundCount}</span>
      </div>
    </div>
  )
}
