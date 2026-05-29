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
    document.documentElement.classList.add('ios-survival-mode-active');
    
    // Also dispatch an event in case JS components need to unmount or simplify themselves
    window.dispatchEvent(new CustomEvent('webview-survival-mode', { detail: { active: true } }));
  }
}
