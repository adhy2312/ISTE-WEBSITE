'use client';

import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

// Register core plugins
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  
  // Core Configuration for High Performance
  gsap.config({
    force3D: true, // Forces hardware acceleration by default
  });

  // Lag smoothing prevents massive jumps if the main thread gets blocked
  gsap.ticker.lagSmoothing(1000, 16); 
  
  // Defaults for a cinematic, breathing feel
  gsap.defaults({
    ease: 'power3.out',
    duration: 1.2
  });
}

export { gsap, ScrollTrigger, useGSAP };
