'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Upload, Crosshair, Terminal } from 'lucide-react';
import { gsap } from 'gsap';

type Phase = 'IDLE' | 'SCANNING' | 'COMPLETE';

export function ResumeAnalyzer() {
  const [phase, setPhase] = useState<Phase>('IDLE');
  const [isDragging, setIsDragging] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const laserRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (phase === 'IDLE') {
      startScanning();
    }
  };

  const handleUploadClick = () => {
    if (phase === 'IDLE') {
      startScanning();
    }
  };

  const startScanning = () => {
    setPhase('SCANNING');
    setLogs([]);
    
    // Laser Animation Using GSAP
    if (laserRef.current) {
      gsap.fromTo(
        laserRef.current,
        { top: '5%' },
        { top: '95%', duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }
      );
    }

    // Cinematic Logic Sequence
    const sequence = [
      { time: 200, text: '[0.2s] Initializing Core ML Weights...' },
      { time: 800, text: '[0.8s] Extracting NLP Tokens (SentenceTransformers)...' },
      { time: 1400, text: '[1.4s] Mapping to Kerala Skill Baseline...' },
      { time: 2100, text: '[2.1s] Checking against SCAM_SIGNALS...' },
      { time: 2800, text: '[2.8s] Rewriting Bullet Points via Semantic Embedding...' },
      { time: 3500, text: '[3.5s] Finalizing ATS Confidence Matrix...' }
    ];

    sequence.forEach((step) => {
      setTimeout(() => {
        setLogs((prev) => [...prev, step.text]);
      }, step.time);
    });

    setTimeout(() => {
      setPhase('COMPLETE');
    }, 4200);
  };

  const handleReset = () => {
    setPhase('IDLE');
    setLogs([]);
  };

  // Re-trigger laser animation if it unmounts/remounts during state change
  useEffect(() => {
    if (phase === 'SCANNING' && laserRef.current) {
      gsap.fromTo(
        laserRef.current,
        { top: '5%' },
        { top: '95%', duration: 1.2, repeat: -1, yoyo: true, ease: 'sine.inOut' }
      );
    }
  }, [phase]);

  return (
    <div 
      ref={containerRef}
      className="w-full max-w-2xl mx-auto p-[1px] rounded-2xl bg-gradient-to-b from-[#4ade80]/30 to-transparent backdrop-blur-xl overflow-hidden relative group"
    >
      <div className="bg-black/80 rounded-[15px] overflow-hidden relative">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#4ade80]/20 bg-white/5">
          <div className="flex items-center gap-3">
            <Crosshair className="w-5 h-5 text-[#4ade80] animate-pulse" />
            <h3 className="text-[#4ade80] font-mono text-xs uppercase tracking-widest font-bold">
              Autonomous ATS Engine
            </h3>
          </div>
          <div className="flex gap-2">
            <div className="w-2 h-2 rounded-full bg-red-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-yellow-500/50"></div>
            <div className="w-2 h-2 rounded-full bg-[#4ade80] shadow-[0_0_10px_#4ade80]"></div>
          </div>
        </div>

        {/* Dynamic Body */}
        <div className="p-8">
          {phase === 'IDLE' && (
            <div 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleUploadClick}
              className={`border-2 border-dashed rounded-xl p-12 text-center cursor-pointer transition-all duration-500
                ${isDragging ? 'border-[#4ade80] bg-[#4ade80]/10 scale-[1.02]' : 'border-white/10 hover:border-[#4ade80]/50 hover:bg-white/5'}`}
            >
              <Upload className={`w-12 h-12 mx-auto mb-4 transition-colors duration-500 ${isDragging ? 'text-[#4ade80] drop-shadow-[0_0_15px_rgba(74,222,128,0.8)]' : 'text-white/40'}`} />
              <p className="text-white font-semibold text-lg mb-2">Drop your resume payload</p>
              <p className="text-white/40 font-mono text-xs">PDF, DOCX (End-to-End Encrypted)</p>
            </div>
          )}

          {phase === 'SCANNING' && (
            <div className="relative h-64 border border-[#4ade80]/30 rounded-xl bg-black/50 overflow-hidden flex items-center justify-center">
              
              {/* Faux Document Silhouette */}
              <div className="w-32 h-44 bg-white/5 rounded border border-white/10 p-4 relative opacity-80 backdrop-blur-md">
                <div className="w-1/2 h-2 bg-white/20 rounded mb-4"></div>
                <div className="w-full h-1.5 bg-white/20 rounded mb-2"></div>
                <div className="w-full h-1.5 bg-white/20 rounded mb-2"></div>
                <div className="w-3/4 h-1.5 bg-white/20 rounded mb-2"></div>
                <div className="w-full h-1.5 bg-[#4ade80]/30 rounded mt-6 mb-2"></div>
                <div className="w-5/6 h-1.5 bg-[#4ade80]/30 rounded mb-2"></div>
              </div>

              {/* The Scanning Laser */}
              <div 
                ref={laserRef}
                className="absolute left-0 right-0 h-[3px] bg-[#4ade80] shadow-[0_0_25px_8px_rgba(74,222,128,0.4)] z-10"
              />
              
              {/* Scan Overlay (Scanlines) */}
              <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(74,222,128,0.03)_50%)] bg-[length:100%_4px] pointer-events-none" />
            </div>
          )}

          {phase === 'COMPLETE' && (
            <div className="text-center p-8 animate-in zoom-in duration-500 fade-in slide-in-from-bottom-4">
              <div className="w-24 h-24 mx-auto rounded-full border-2 border-[#4ade80] flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(74,222,128,0.3)] relative overflow-hidden">
                <div className="absolute inset-0 bg-[#4ade80]/10 animate-pulse"></div>
                <span className="text-4xl font-black text-[#4ade80] tracking-tighter z-10">98</span>
                <span className="text-[#4ade80] text-sm absolute bottom-4 right-4 z-10 font-bold">%</span>
              </div>
              <h2 className="text-2xl font-black text-white tracking-tight mb-2">Elite Candidate</h2>
              <p className="text-[#4ade80] mb-8 font-mono text-xs uppercase tracking-widest bg-[#4ade80]/10 inline-block px-3 py-1 rounded">
                ATS Defeat Matrix: Successful
              </p>
              <br/>
              <button 
                onClick={handleReset}
                className="px-6 py-3 bg-transparent hover:bg-[#4ade80]/10 text-[#4ade80] border border-[#4ade80]/50 hover:border-[#4ade80] rounded font-mono text-xs uppercase tracking-widest transition-all"
              >
                Scan Another Payload
              </button>
            </div>
          )}
        </div>

        {/* Terminal Logger */}
        {(phase === 'SCANNING' || phase === 'COMPLETE') && (
          <div className="bg-black/90 border-t border-[#4ade80]/20 p-5 h-48 overflow-y-auto font-mono text-[11px] leading-relaxed relative">
            <div className="flex items-center gap-2 text-[#4ade80]/50 mb-4 sticky top-0 bg-black/90 py-1 backdrop-blur-xl">
              <Terminal className="w-3.5 h-3.5" />
              <span className="tracking-widest">TERMINAL OUTPUT // LIVE STREAM</span>
            </div>
            
            <div className="space-y-2">
              {logs.map((log, i) => (
                <div key={i} className="text-[#4ade80] opacity-90 flex items-start gap-3 animate-in slide-in-from-left-2 fade-in duration-300">
                  <span className="text-white/30 shrink-0 select-none">root@engine:~#</span>
                  <span>{log}</span>
                </div>
              ))}
              
              {phase === 'SCANNING' && (
                <div className="text-[#4ade80] opacity-50 flex items-start gap-3">
                  <span className="text-white/30 select-none">root@engine:~#</span>
                  <span className="w-2 h-3.5 bg-[#4ade80] inline-block mt-0.5 animate-pulse" />
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
