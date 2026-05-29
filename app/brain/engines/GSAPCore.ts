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

  // iOS Safari Fix: normalizeScroll prevents address-bar-resize jitter
  // and synchronizes iOS's async scroll thread with GSAP's calculations.
  // This is the #1 recommended fix from GSAP's official docs for iOS.
  const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
  if (isIOS) {
    ScrollTrigger.normalizeScroll(true);
  }

  // Refresh ScrollTrigger after full page load to fix miscalculated positions
  // caused by lazy-loaded images and fonts shifting the layout
  window.addEventListener('load', () => {
    setTimeout(() => {
      ScrollTrigger.refresh();
    }, 500);
  });
}

export { gsap, ScrollTrigger, useGSAP };
