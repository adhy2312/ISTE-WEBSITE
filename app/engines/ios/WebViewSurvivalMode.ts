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
    
    // We must NOT actively purge heavy DOM elements using el.remove() 
    // because this causes violent React Hydration mismatch errors on iOS.
    // Instead, we let CSS handle the display: none using the .ios-webview-survival class.
    
    console.warn('[WebViewSurvivalMode] Engaged: Heavy CSS and DOM nodes purged for iOS in-app browser stability.');

    // Also dispatch an event in case JS components need to unmount or simplify themselves
    window.dispatchEvent(new CustomEvent('webview-survival-mode', { detail: { active: true } }));
  }
}
