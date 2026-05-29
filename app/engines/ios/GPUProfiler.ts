'use client';

import { getActiveProfile } from './AdaptiveRenderingProfiles';

export class GPUProfiler {
  private static fpsBuffer: number[] = [];
  private static lastTime: number = 0;
  private static frameCount: number = 0;
  private static isThrottled: boolean = false;
  private static animationFrameId: number | null = null;
  
  static start() {
    if (typeof window === 'undefined') return;
    
    // Only profile heavily on iOS profiles where we need to throttle
    const profile = getActiveProfile();
    if (profile !== 'IOSAdaptive' && profile !== 'IOSWebViewSurvival') {
      return;
    }

    this.lastTime = performance.now();
    this.loop();
  }

  static stop() {
    if (this.animationFrameId !== null) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
  }

  private static loop() {
    const now = performance.now();
    const delta = now - this.lastTime;
    
    this.frameCount++;
    
    if (delta >= 1000) {
      const fps = (this.frameCount * 1000) / delta;
      this.fpsBuffer.push(fps);
      
      if (this.fpsBuffer.length > 5) {
        this.fpsBuffer.shift();
      }
      
      this.evaluatePressure();
      
      this.frameCount = 0;
      this.lastTime = now;
    }
    
    this.animationFrameId = requestAnimationFrame(() => this.loop());
  }

  private static evaluatePressure() {
    if (this.fpsBuffer.length < 3) return;
    
    const avgFps = this.fpsBuffer.reduce((a, b) => a + b, 0) / this.fpsBuffer.length;
    
    if (avgFps < 30 && !this.isThrottled) {
      this.throttleRendering();
    } else if (avgFps > 55 && this.isThrottled) {
      this.restoreRendering();
    }
  }

  private static throttleRendering() {
    this.isThrottled = true;
    document.documentElement.classList.add('ios-gpu-throttled');
    // Dispatch event so other components can reduce effects
    window.dispatchEvent(new CustomEvent('gpu-pressure', { detail: { throttled: true } }));
  }

  private static restoreRendering() {
    this.isThrottled = false;
    document.documentElement.classList.remove('ios-gpu-throttled');
    window.dispatchEvent(new CustomEvent('gpu-pressure', { detail: { throttled: false } }));
  }

  static isCurrentlyThrottled() {
    return this.isThrottled;
  }
}
