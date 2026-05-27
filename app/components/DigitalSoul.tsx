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

    const startTime = Date.now();

    const loop = () => {
      time += 0.01;
      
      const timeSpent = Date.now() - startTime;
      const isAwake = timeSpent > 300000; // 5 mins in ms

      const docHeight = document.documentElement.scrollHeight || window.innerHeight;

      // 1. Autonomous Wandering (Perlin-noise-like movement)
      targetX = (window.innerWidth / 2) + Math.sin(time * 0.5) * (window.innerWidth * 0.4) + Math.cos(time * 0.8) * 50;
      
      if (isAwake) {
        // Freely wanders the whole document if awake
        targetY = (docHeight / 2) + Math.cos(time * 0.6) * (docHeight * 0.4);
      } else {
        // Dwells subtly at the bottom of the website
        targetY = docHeight - 150 + Math.cos(time * 0.4) * 100;
      }

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

      // Very subtle opacity
      soul.style.opacity = state.isThinking ? '0.2' : '0.08';

      raf = requestAnimationFrame(loop);
    };

    raf = requestAnimationFrame(loop);

    return () => cancelAnimationFrame(raf);
  }, []);

  return (
    <div
      ref={soulRef}
      style={{
        position: 'absolute', // Absolute to the document, not fixed to screen
        top: -150, // Offset center
        left: -150,
        width: 300,
        height: 300,
        borderRadius: '50%',
        pointerEvents: 'none',
        zIndex: -1, // Strictly behind footer and all content
        willChange: 'transform, background',
        mixBlendMode: 'screen',
      }}
    />
  );
}
