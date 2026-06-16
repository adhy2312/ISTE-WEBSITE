'use client';

import { useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const STATS_DATA = [
  { value: '300+', label: 'Active Members', desc: 'A thriving community of builders and leaders.', angle: 315 },
  { value: '50+', label: 'Flagship Events', desc: 'Workshops, hackathons, and technical symposiums.', angle: 45 },
  { value: '6', label: 'Years of Legacy', desc: 'Empowering students since our charter in 2019.', angle: 225 },
  { value: '60+', label: 'Industry Links', desc: 'Direct bridges to top-tier internships & jobs.', angle: 135 },
];

export default function ImpactChronicle() {
  const containerRef = useRef<HTMLElement>(null);
  
  useGSAP(() => {
    if (!containerRef.current) return;

    // Center core pulse
    gsap.to('.core-glow', {
      scale: 1.2,
      opacity: 0.8,
      duration: 2.5,
      yoyo: true,
      repeat: -1,
      ease: 'sine.inOut'
    });

    // Slow rotation of the background orbital rings
    gsap.to('.orbital-ring-1', { rotation: 360, duration: 60, repeat: -1, ease: 'linear' });
    gsap.to('.orbital-ring-2', { rotation: -360, duration: 80, repeat: -1, ease: 'linear' });

    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: containerRef.current,
        start: 'top 60%',
      }
    });

    tl.fromTo('.ecosystem-title', 
      { opacity: 0, y: 30 },
      { opacity: 1, y: 0, duration: 1, ease: 'power3.out' }
    )
    .fromTo('.core-node',
      { scale: 0, opacity: 0 },
      { scale: 1, opacity: 1, duration: 1.2, ease: 'back.out(1.5)' },
      "-=0.5"
    )
    .fromTo('.connector-line',
      { strokeDashoffset: 1000 },
      { strokeDashoffset: 0, duration: 1.5, ease: 'power2.inOut', stagger: 0.1 },
      "-=0.6"
    )
    .fromTo('.stat-node',
      { opacity: 0, scale: 0.8, y: 20 },
      { opacity: 1, scale: 1, y: 0, duration: 0.8, stagger: 0.1, ease: 'back.out(1.2)' },
      "-=1.0"
    );

  }, { scope: containerRef });

  return (
    <section 
      id="impact" 
      ref={containerRef}
      className="relative w-full py-24 md:py-32 overflow-hidden bg-[#020202] flex items-center justify-center min-h-[100vh]"
    >
      {/* Subtle Background Gradients */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-900/10 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 flex flex-col items-center">
        
        <div className="text-center mb-12 lg:mb-16 ecosystem-title relative z-30">
          <div className="text-blue-400 font-mono text-xs md:text-sm tracking-[0.3em] uppercase mb-4">Professional Society Ecosystem</div>
          <h2 className="text-5xl md:text-7xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-serif)' }}>
            The <span className="italic text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Synergy</span> Matrix
          </h2>
          <p className="mt-6 text-white/50 max-w-2xl mx-auto text-lg leading-relaxed">
            A continuous loop of knowledge, innovation, and leadership forming the ultimate technical ecosystem for our members.
          </p>
        </div>

        {/* DESKTOP Orbital Visualization */}
        <div className="hidden lg:flex relative w-full max-w-[900px] aspect-square items-center justify-center mt-4">
          
          {/* Orbital Rings */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-30">
            <div className="orbital-ring-1 absolute w-[85%] h-[85%] border border-white/10 rounded-full" />
            <div className="orbital-ring-2 absolute w-[60%] h-[60%] border border-dashed border-blue-400/30 rounded-full" />
            <div className="orbital-ring-1 absolute w-[35%] h-[35%] border border-white/5 rounded-full" />
          </div>

          {/* Central Core */}
          <div className="core-node absolute z-20 flex items-center justify-center">
            <div className="core-glow absolute w-40 h-40 bg-blue-500/20 rounded-full blur-3xl" />
            <div className="relative w-28 h-28 bg-gradient-to-br from-[#0a192f] to-black border border-blue-500/40 rounded-full flex flex-col items-center justify-center shadow-[0_0_50px_rgba(59,130,246,0.2)] backdrop-blur-xl">
              <span className="text-white font-black tracking-widest text-2xl">ISTE</span>
              <span className="text-blue-400/60 text-[10px] font-mono tracking-widest mt-1">CORE</span>
            </div>
          </div>

          {/* Connectors & Stat Nodes */}
          <svg className="absolute inset-0 w-full h-full pointer-events-none z-10" viewBox="0 0 1000 1000">
            {STATS_DATA.map((stat, i) => {
              const radius = 330; // Distance from center to dot
              const centerX = 500;
              const centerY = 500;
              const rad = (stat.angle * Math.PI) / 180;
              const endX = centerX + radius * Math.cos(rad);
              const endY = centerY + radius * Math.sin(rad);

              return (
                <line 
                  key={`line-${i}`}
                  x1={centerX} 
                  y1={centerY} 
                  x2={endX} 
                  y2={endY} 
                  className="connector-line"
                  stroke="url(#grad)" 
                  strokeWidth="2"
                  strokeDasharray="1000"
                  strokeDashoffset="1000"
                  opacity="0.6"
                />
              );
            })}
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3b82f6" stopOpacity="1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
              </linearGradient>
            </defs>
          </svg>

          {/* HTML Nodes Placed absolutely */}
          {STATS_DATA.map((stat, i) => {
            const rad = (stat.angle * Math.PI) / 180;
            const leftPercent = 50 + (Math.cos(rad) * 33); // 33% of container
            const topPercent = 50 + (Math.sin(rad) * 33);
            
            // Determine alignment based on quadrant to push the card away from center
            const isLeft = Math.cos(rad) < 0;
            const isTop = Math.sin(rad) < 0;

            return (
              <div 
                key={`node-${i}`}
                className="stat-node absolute z-30 flex items-center justify-center"
                style={{ 
                  left: `${leftPercent}%`, 
                  top: `${topPercent}%`,
                }}
              >
                {/* Connecting Dot exactly at coordinates */}
                <div className="absolute w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.8)] z-10 -translate-x-1/2 -translate-y-1/2" />
                
                {/* Content Panel positioned away from the dot */}
                <div 
                  className="absolute w-[260px] group cursor-default"
                  style={{
                    ...(isLeft ? { right: '15px' } : { left: '15px' }),
                    ...(isTop ? { bottom: '10px' } : { top: '10px' }),
                  }}
                >
                  <div className="bg-white/[0.02] border border-white/10 backdrop-blur-xl rounded-2xl p-6 transition-all duration-500 hover:bg-white/[0.06] hover:border-blue-500/40 hover:-translate-y-2 hover:shadow-[0_10px_40px_-10px_rgba(59,130,246,0.3)]">
                    <div className="text-5xl font-black text-white mb-2 tracking-tighter">
                      {stat.value}
                    </div>
                    <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3">
                      {stat.label}
                    </div>
                    <div className="text-sm text-white/50 leading-relaxed font-light">
                      {stat.desc}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* MOBILE Linear Layout */}
        <div className="flex lg:hidden flex-col gap-6 w-full mt-8 relative z-20">
          {STATS_DATA.map((stat, i) => (
            <div key={`mobile-node-${i}`} className="stat-node bg-white/[0.03] border border-white/10 backdrop-blur-xl rounded-2xl p-8 text-center relative overflow-hidden">
              {/* Ambient Mobile Glow */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
              
              <div className="text-6xl font-black text-white mb-2 tracking-tighter relative z-10">{stat.value}</div>
              <div className="text-sm font-bold text-blue-400 uppercase tracking-widest mb-3 relative z-10">{stat.label}</div>
              <div className="text-base text-white/60 leading-relaxed relative z-10">{stat.desc}</div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
