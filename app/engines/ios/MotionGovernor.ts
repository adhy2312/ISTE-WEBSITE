'use client';

import { getActiveProfile } from './AdaptiveRenderingProfiles';

export class MotionGovernor {
  private static profile: ReturnType<typeof getActiveProfile> = 'DesktopUltra';

  static init() {
    if (typeof window === 'undefined') return;
    this.profile = getActiveProfile();

    if (this.profile === 'IOSAdaptive' || this.profile === 'IOSWebViewSurvival') {
      document.documentElement.classList.add('ios-motion-governed');
      if (this.profile === 'IOSWebViewSurvival') {
        document.documentElement.classList.add('ios-webview-survival');
      }
    }
  }

  static getParticleDensity(): number {
    if (this.profile === 'IOSWebViewSurvival') return 0.2;
    if (this.profile === 'IOSAdaptive') return 0.5;
    return 1.0; // Desktop and Android untouched
  }

  static getBlurRadius(baseRadius: string): string {
    if (this.profile === 'IOSWebViewSurvival') return '0px'; // Disable heavy blur
    if (this.profile === 'IOSAdaptive') return '4px'; // Simplified blur
    return baseRadius;
  }

  static shouldDisableVolumetricLighting(): boolean {
    return this.profile === 'IOSWebViewSurvival' || this.profile === 'EmergencyLowPower';
  }
}
