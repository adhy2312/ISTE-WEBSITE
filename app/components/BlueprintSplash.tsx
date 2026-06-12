'use client';

import { useEffect, useState, useRef } from 'react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

export default function BlueprintSplash() {
  const [show, setShow] = useState(false);
  const [mounted, setMounted] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/exhaustive-deps
    setMounted(true);
    // Check if the splash screen has already played in this session
    if (!sessionStorage.getItem('iste_splash_played')) {
      setShow(true);
    }
  }, []);

  useGSAP(() => {
    if (!show || !containerRef.current) return;

    // We block scroll while splash is active
    document.body.style.overflow = 'hidden';

    const tl = gsap.timeline({
      onComplete: () => {
        sessionStorage.setItem('iste_splash_played', 'true');
        document.body.style.overflow = ''; // restore scroll
        
        // Fade out the entire overlay
        gsap.to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: 'power2.inOut',
          onComplete: () => setShow(false)
        });
      }
    });

    // 1. Grid lines draw in
    tl.fromTo('.bp-grid-line-h', 
      { scaleX: 0 }, 
      { scaleX: 1, duration: 1.2, stagger: 0.05, ease: 'power3.inOut', transformOrigin: 'left center' }, 
      0
    );
    tl.fromTo('.bp-grid-line-v', 
      { scaleY: 0 }, 
      { scaleY: 1, duration: 1.2, stagger: 0.05, ease: 'power3.inOut', transformOrigin: 'top center' }, 
      0
    );

    // 2. SVG Path drawing (ISTE)
    tl.fromTo('.iste-path', 
      { strokeDashoffset: 400, strokeDasharray: 400 }, 
      { strokeDashoffset: 0, duration: 1.8, ease: 'power2.inOut', stagger: 0.15 }, 
      0.6
    );

    // 3. Subtitle fade in
    tl.fromTo('.bp-subtitle', 
      { opacity: 0, y: 10, letterSpacing: '0.1em' }, 
      { opacity: 1, y: 0, letterSpacing: '0.3em', duration: 1, ease: 'power2.out' }, 
      1.8
    );
      
    // 4. Subtle sweep of light across the logo
    tl.fromTo('.bp-sweep',
      { x: '-100%', opacity: 0 },
      { x: '200%', opacity: 0.6, duration: 1.2, ease: 'power2.inOut' }, 
      2.0
    );

    // Brief pause before fading out the whole screen
    tl.to({}, { duration: 0.6 }); 
  }, { scope: containerRef, dependencies: [show] });

  if (!mounted || !show) return null;

  return (
    <div 
      ref={containerRef}
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: '#030712', // Very dark slate/navy
        zIndex: 99999, // Above everything
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    >
      {/* Blueprint Grid Background */}
      <div style={{ position: 'absolute', inset: 0, opacity: 0.15, pointerEvents: 'none' }}>
        {/* Horizontal Lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`h-${i}`} className="bp-grid-line-h" style={{ 
            position: 'absolute', top: `${(i + 1) * 8.33}%`, left: 0, right: 0, height: '1px', backgroundColor: '#38bdf8' 
          }} />
        ))}
        {/* Vertical Lines */}
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={`v-${i}`} className="bp-grid-line-v" style={{ 
            position: 'absolute', left: `${(i + 1) * 8.33}%`, top: 0, bottom: 0, width: '1px', backgroundColor: '#38bdf8' 
          }} />
        ))}
      </div>

      {/* SVG Logo Assembly */}
      <div style={{ position: 'relative', width: '230px', height: '100px', zIndex: 2 }}>
         <svg viewBox="0 0 230 100" fill="none" stroke="#f8fafc" strokeWidth="3" strokeLinecap="square" strokeLinejoin="miter" style={{ overflow: 'visible' }}>
            {/* I */}
            <path className="iste-path" d="M 25 20 L 25 80 M 10 20 L 40 20 M 10 80 L 40 80" />
            {/* S */}
            <path className="iste-path" d="M 100 20 L 60 20 L 60 50 L 100 50 L 100 80 L 60 80" />
            {/* T */}
            <path className="iste-path" d="M 120 20 L 160 20 M 140 20 L 140 80" />
            {/* E */}
            <path className="iste-path" d="M 220 20 L 180 20 L 180 80 L 220 80 M 180 50 L 210 50" />
         </svg>
         
         {/* Light sweep */}
         <div className="bp-sweep" style={{
            position: 'absolute',
            top: 0, bottom: 0, left: 0, width: '40px',
            background: 'linear-gradient(90deg, transparent, rgba(56, 189, 248, 0.8), transparent)',
            transform: 'skewX(-20deg)',
            filter: 'blur(8px)',
            pointerEvents: 'none'
         }} />
      </div>

      {/* Subtitle */}
      <div className="bp-subtitle" style={{
         marginTop: '40px',
         fontFamily: '"JetBrains Mono", monospace',
         fontSize: '0.8rem',
         color: '#38bdf8',
         textTransform: 'uppercase',
         zIndex: 2,
         opacity: 0
      }}>
         Mar Baselios College
      </div>

      {/* Ambient center glow */}
      <div style={{
         position: 'absolute',
         top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
         width: '400px', height: '400px',
         background: 'radial-gradient(circle, rgba(56, 189, 248, 0.05) 0%, transparent 70%)',
         pointerEvents: 'none',
         zIndex: 1
      }} />
    </div>
  );
}
