'use client';

import { getActiveProfile } from './AdaptiveRenderingProfiles';

export class WebViewSurvivalMode {
  static init() {
    if (typeof window === 'undefined') return;

    const profile = getActiveProfile();
    
    if (profile === 'IOSWebViewSurvival') {
      this.activateSurvivalMode();
    }
  }

  private static activateSurvivalMode() {
    // This removes heavy shaders, complex blur, and other memory-heavy features via CSS
    document.documentElement.classList.add('ios-webview-survival');
    document.documentElement.classList.add('ios-gpu-throttled');
    
    // Actively purge heavy DOM elements to prevent WebKit Jetsam kills
    if (typeof window !== 'undefined') {
      const purgeHeavyElements = () => {
        const elements = document.querySelectorAll('.aurora-ribbon, .noise-overlay, .orbital-lines, .grid-lines');
        elements.forEach(el => el.remove());
      };
      
      // Purge immediately and after a short delay (post-hydration)
      purgeHeavyElements();
      setTimeout(purgeHeavyElements, 1000);
      setTimeout(purgeHeavyElements, 3000);
    }
    
    console.warn('[WebViewSurvivalMode] Engaged: Heavy CSS and DOM nodes purged for iOS in-app browser stability.');

    // Also dispatch an event in case JS components need to unmount or simplify themselves
    window.dispatchEvent(new CustomEvent('webview-survival-mode', { detail: { active: true } }));
  }
}
