'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';
import { gsap } from './engines/GSAPCore';

/**
 * ENGINE 42: PERFORMANCE AMPLIFIER
 * 
 * Wires directly into the Performance Engine.
 * Instead of waiting for FPS to drop (reactive), this engine proactively
 * profiles the hardware (cores, memory, connection) and instantly degrades
 * or amplifies visual fidelity before rendering even begins.
 */
export default function PerformanceAmplifier() {
  const brain = useBrain();
  const amplifiedRef = useRef(false);

  useEffect(() => {
    brain.registerEngine('Amplifier');

    // Hardware Profiling
    const cores = navigator.hardwareConcurrency || 4;
    // @ts-ignore (deviceMemory is non-standard but supported in Chromium)
    const memory = navigator.deviceMemory || 4;
    // @ts-ignore
    const connection = navigator.connection?.effectiveType || '4g';

    // Proactive Amplifier Logic
    if (cores < 4 || memory < 4 || connection === '3g' || connection === '2g') {
      // Hardware is heavily constrained. Engage amplifier by cutting fat preemptively.
      if (!amplifiedRef.current) {
        amplifiedRef.current = true;
        document.documentElement.setAttribute('data-amplifier', 'engaged');
        
        // Notify the main Performance engine to preemptively trigger low-power mode
        brain.notifyEngine('Performance', 'preemptive_degradation', {
          reason: `Constrained hardware: ${cores} cores, ${memory}GB RAM`,
        });

        // Throttle GSAP animations to save CPU overhead
        gsap.ticker.fps(30); 
        gsap.ticker.lagSmoothing(500, 33);
        
        console.log('%c[Performance Amplifier] Engaged: Hardware profiling detected low specs. Stripping volumetric layers & throttling GSAP to 30fps.', 'color: #00f0ff; font-weight: bold;');
      }
    } else {
      // Hardware is powerful. Allow full cinematic rendering.
      document.documentElement.setAttribute('data-amplifier', 'max-fidelity');
      gsap.ticker.fps(60); // Ensure butter smooth 60fps on high-end
      console.log('%c[Performance Amplifier] Max Fidelity: Hardware profiling cleared.', 'color: #39ff14; font-weight: bold;');
    }

    // Cleanup
    return () => {
      document.documentElement.removeAttribute('data-amplifier');
    };
  }, []); // Remove brain from dependencies to prevent infinite loops

  return null;
}
