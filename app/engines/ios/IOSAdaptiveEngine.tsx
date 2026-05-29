'use client';

import { useEffect } from 'react';
import { SafariCompatibilityLayer } from './SafariCompatibilityLayer';
import { WebViewSurvivalMode } from './WebViewSurvivalMode';
import { MotionGovernor } from './MotionGovernor';
import { GPUProfiler } from './GPUProfiler';
import { HydrationSafetyLayer } from './HydrationSafetyLayer';
import { getActiveProfile } from './AdaptiveRenderingProfiles';

export default function IOSAdaptiveEngine() {
  useEffect(() => {
    const profile = getActiveProfile();

    // The engine only activates its heavy optimizations and compatibility fixes 
    // for iOS devices and WebViews.
    if (profile === 'IOSAdaptive' || profile === 'IOSWebViewSurvival') {
      SafariCompatibilityLayer.init();
      WebViewSurvivalMode.init();
      MotionGovernor.init();
      GPUProfiler.start();

      console.log(`[IOSAdaptiveEngine] Initialized with profile: ${profile}`);
    }

    return () => {
      GPUProfiler.stop();
    };
  }, []);

  // Return a transparent hydration wrapper.
  // It renders nothing visually, only applies the runtime systems above
  // and acts as a boundary.
  return (
    <HydrationSafetyLayer>
      <div id="ios-adaptive-engine-root" style={{ display: 'none' }} aria-hidden="true" />
    </HydrationSafetyLayer>
  );
}
