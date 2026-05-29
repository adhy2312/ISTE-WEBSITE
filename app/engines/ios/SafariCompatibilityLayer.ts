'use client';

import { getActiveProfile } from './AdaptiveRenderingProfiles';

export class SafariCompatibilityLayer {
  static init() {
    if (typeof window === 'undefined') return;

    const profile = getActiveProfile();
    
    // Only run for iOS profiles
    if (profile === 'IOSAdaptive' || profile === 'IOSWebViewSurvival') {
      this.applyCSSFixes();
      this.handleViewportHeight();
    }
  }

  private static applyCSSFixes() {
    document.documentElement.classList.add('safari-compatibility-mode');
  }

  private static handleViewportHeight() {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    setVh();
    window.addEventListener('resize', setVh);
    window.addEventListener('orientationchange', setVh);
  }
}
