'use client';
import React, { useEffect, useRef } from 'react';
import { useBrain } from '../brain/BrainProvider';
import { gsap } from '../brain/engines/GSAPCore';

export default function DigitalSoul() {
  const { soulState, perfMetrics, creativeState } = useBrain();
  const soulRef = useRef<HTMLDivElement>(null);
  
  // Use refs to track state without breaking the animation loop
  const stateRef = useRef({ 
    isThinking: soulState.isThinking, 
    intervention: perfMetrics.intervention,
    immersiveMode: creativeState?.immersiveMode
  });

  // Sync state to refs immediately
  useEffect(() => {
    stateRef.current = {
      isThinking: soulState.isThinking,
      intervention: perfMetrics.intervention,
      immersiveMode: creativeState?.immersiveMode
    };
  }, [soulState.isThinking, perfMetrics.intervention, creativeState]);

  useEffect(() => {
    const soul = soulRef.current;
    if (!soul) return;

    let soulX = window.innerWidth / 2;
    let soulY = window.innerHeight - 150;
    let targetX = soulX;
    let targetY = soulY;
    let time = 0;
    let frameCount = 0;
    const startTime = Date.now();
    let lastBg = '';

    const loop = () => {
      frameCount++;
      // Throttle to ~20fps (skip every 2 frames out of 3)
      if (frameCount % 3 !== 0) {
        return;
      }

      time += 0.01;
      const timeSpent = Date.now() - startTime;
      const isAwake = timeSpent > 300000;
      const docHeight = document.documentElement.scrollHeight || window.innerHeight;

      targetX = (window.innerWidth / 2) + Math.sin(time * 0.5) * (window.innerWidth * 0.4) + Math.cos(time * 0.8) * 50;
      let rawTargetY = isAwake
        ? (docHeight / 2) + Math.cos(time * 0.6) * (docHeight * 0.4)
        : docHeight - 150 + Math.cos(time * 0.4) * 100;

      // CRITICAL: Prevent infinite scroll to darkness.
      // The element's height is 300px with top: -150px. Its bottom edge is at targetY + 150.
      // If targetY + 150 > docHeight, it expands the document, causing an infinite loop.
      const safeMaxY = docHeight - 155; // 5px safety margin
      targetY = Math.min(rawTargetY, safeMaxY);

      soulX += (targetX - soulX) * 0.02;
      soulY += (targetY - soulY) * 0.02;

      const state = stateRef.current;
      soul.style.transform = `translate3d(${soulX | 0}px, ${soulY | 0}px, 0) scale(${state.immersiveMode ? 3 : 1.0})`;

      // Only rebuild background string when state changes
      const nextBg = state.intervention ? 'i' : state.immersiveMode ? 'm' : state.isThinking ? 't' : 'n';
      if (nextBg !== lastBg) {
        lastBg = nextBg;
        if (state.intervention) {
          soul.style.background = 'radial-gradient(circle, rgba(var(--c-main), 0.1) 0%, transparent 40%)';
        } else if (state.immersiveMode) {
          soul.style.background = 'radial-gradient(circle, rgba(var(--c-main), 0.8) 0%, rgba(var(--c-alt2), 0.5) 40%, transparent 80%)';
        } else if (state.isThinking) {
          soul.style.background = 'radial-gradient(circle, rgba(255,255,255,0.6) 0%, rgba(var(--c-main), 0.4) 30%, transparent 70%)';
        } else {
          soul.style.background = 'radial-gradient(circle, rgba(var(--c-alt2), 0.3) 0%, rgba(var(--c-alt1), 0.15) 40%, transparent 70%)';
        }
        soul.style.opacity = state.isThinking ? '0.2' : '0.08';
      }

    };

    gsap.ticker.add(loop);
    return () => gsap.ticker.remove(loop);
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
