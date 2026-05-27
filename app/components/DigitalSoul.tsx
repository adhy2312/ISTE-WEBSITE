'use client';
import React, { useEffect, useRef } from 'react';
import { useBrain } from '../brain/BrainProvider';

export default function DigitalSoul() {
  const { soulState, perfMetrics, creativeState } = useBrain();
  const soulRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track state without breaking the animation loop
  const stateRef = useRef({ 
    isThinking: soulState.isThinking, 
    scrollVelocity: soulState.scrollVelocity,
    intervention: perfMetrics.intervention,
    immersiveMode: creativeState?.immersiveMode
  });

  // Sync state to refs immediately
  useEffect(() => {
    stateRef.current = {
      isThinking: soulState.isThinking,
      scrollVelocity: soulState.scrollVelocity,
      intervention: perfMetrics.intervention,
      immersiveMode: creativeState?.immersiveMode
    };
  }, [soulState.isThinking, soulState.scrollVelocity, perfMetrics.intervention, creativeState]);

  useEffect(() => {
    const soul = soulRef.current;
    if (!soul) return;

    // Autonomous wandering physics
    let soulX = window.innerWidth / 2;
    let soulY = window.innerHeight / 2;
    let targetX = soulX;
    let targetY = soulY;
    let time = 0;

    let raf: number;

    const loop = () => {
      time += 0.01;

      // 1. Autonomous Wandering (Perlin-noise-like movement)
      // The soul slowly drifts around the screen subconsciously
      targetX = (window.innerWidth / 2) + Math.sin(time * 0.5) * (window.innerWidth * 0.3) + Math.cos(time * 0.8) * 100;
      targetY = (window.innerHeight / 2) + Math.cos(time * 0.6) * (window.innerHeight * 0.3) + Math.sin(time * 0.4) * 100;

      // Fluid lerp towards target
      soulX += (targetX - soulX) * 0.02;
      soulY += (targetY - soulY) * 0.02;

      // 2. Engine Interconnections
      // Neural Engine: Pulse and enlarge when thinking
      const state = stateRef.current;
      const scale = state.isThinking ? 1.5 + Math.sin(time * 15) * 0.2 : 1.0;
      
      // Scroll Engine: Stretch vertically based on scroll velocity (motion blur effect)
      const stretch = 1 + Math.min(Math.abs(state.scrollVelocity) * 0.05, 3);
      
      soul.style.transform = `translate3d(${soulX}px, ${soulY}px, 0) scale(${state.immersiveMode ? 3 : scale}) scaleY(${stretch})`;
      
      // Dynamic brightness based on Neural Engine & Performance AI
      if (state.intervention) {
        // AI Intervention: Minimum possible footprint
        soul.style.background = 'radial-gradient(circle, rgba(var(--c-main), 0.1) 0%, transparent 40%)';
      } else if (state.immersiveMode) {
        soul.style.background = 'radial-gradient(circle, rgba(var(--c-main), 0.8) 0%, rgba(var(--c-alt2), 0.5) 40%, transparent 80%)';
      } else if (state.isThinking) {
        soul.style.background = 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(var(--c-main), 0.4) 30%, transparent 70%)';
      } else {
        soul.style.background = 'radial-gradient(circle, rgba(var(--c-alt2), 0.3) 0%, rgba(var(--c-alt1), 0.15) 40%, transparent 70%)';
      }

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={soulRef}
      style={{
        position: 'fixed',
        top: -150, // Offset center
        left: -150,
        width: 300,
        height: 300,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: 0, // Behind the content, inside the background
        willChange: 'transform, background',
        mixBlendMode: 'screen',
      }}
    />
  );
}
