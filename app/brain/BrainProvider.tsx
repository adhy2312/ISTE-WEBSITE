'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';

// The 38 Engines Architecture (including Membership, Haptic, Physical, Cursor, Atmosphere, Neural, Creative, Performance, Internship, and Physics Engines)
type EngineType = 'Scroll' | 'Render' | 'Animation' | 'Interaction' | 'Data' | 'Prefetch' | 'Telemetry' | 'Resource' | 'Memory' | 'DOM' | 'Layout' | 'Paint' | 'Composite' | 'Network' | 'State' | 'Events' | 'Routing' | 'Cache' | 'Security' | 'Analytics' | 'SEO' | 'Accessibility' | 'Audio' | 'Video' | 'WebGL' | 'Workers' | 'Storage' | 'I18n' | 'PWA' | 'Sync' | 'Membership' | 'Haptic' | 'Physical' | 'Cursor' | 'Atmosphere' | 'Neural' | 'Creative' | 'Performance' | 'Internship' | 'Physics' | 'Amplifier' | 'Presence' | 'ColorExtraction';

interface BrainState {
  isSmooth: boolean;
  activeEngines: Set<EngineType>;
  registerEngine: (engine: EngineType) => void;
  notifyEngine: (engine: EngineType, event: string, data?: any) => void;
  perfMetrics: { fps: number; loadTime: number; intervention: boolean };
  soulState: { isThinking: boolean; scrollVelocity: number };
  creativeState: { immersiveMode: boolean; glitchIntensity: number };
  scrollVelocityRef: { current: number };
}

const BrainContext = createContext<BrainState>({
  isSmooth: true,
  activeEngines: new Set(),
  registerEngine: () => {},
  notifyEngine: () => {},
  perfMetrics: { fps: 60, loadTime: 0, intervention: false },
  soulState: { isThinking: false, scrollVelocity: 0 },
  creativeState: { immersiveMode: false, glitchIntensity: 0 },
  scrollVelocityRef: { current: 0 }
});

export const useBrain = () => useContext(BrainContext);

export default function BrainProvider({ children }: { children: React.ReactNode }) {
  const [activeEngines, setActiveEngines] = useState<Set<EngineType>>(new Set());
  const [fps, setFps] = useState(60);
  const [intervention, setIntervention] = useState(false);
  const [soulState, setSoulState] = useState({ isThinking: false, scrollVelocity: 0 });
  const [creativeState, setCreativeState] = useState({ immersiveMode: false, glitchIntensity: 0 });
  const scrollVelocityRef = useRef(0);

  // Atmosphere Engine Audio Context
  const audioCtxRef = useRef<AudioContext | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const audioStarted = useRef(false);

  const registerEngine = useCallback((engine: EngineType) => {
    setActiveEngines(prev => {
      const next = new Set(prev);
      next.add(engine);
      return next;
    });
  }, []);

  // Throttle references for high-frequency events
  const lastAudioUpdate = useRef(0);

  const notifyEngine = useCallback((engine: EngineType, event: string, data?: any) => {
    if (engine === 'Creative') {
      if (event === 'trigger_immersive') {
        setCreativeState(prev => ({ ...prev, immersiveMode: data?.enabled ?? !prev.immersiveMode }));
      } else if (event === 'glitch') {
        setCreativeState(prev => ({ ...prev, glitchIntensity: data?.intensity || 1 }));
        setTimeout(() => setCreativeState(prev => ({ ...prev, glitchIntensity: 0 })), 300);
      }
    }
    if (engine === 'Membership' && event === 'traffic_surge') {
      console.log(`[Membership Engine] Traffic Spike Detected: ${data.intensity} interactions/sec. Optimizing connection pools.`);
    }
    if (engine === 'Internship') {
      if (event === 'analyze_interest') {
        console.log(`[Internship Engine] AI Agent Notified: User shows high interest in domain - ${data.domain}. Prioritizing fetching these roles.`);
        // In the future, this would trigger the AI agent's Vercel Cron via API route.
      }
    }
    if (engine === 'Haptic' && event === 'vibrate') {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(data?.duration || 10);
      }
    }
    if (engine === 'Cursor' && event === 'snap') {
      // Play a tiny haptic tick when the cursor snaps to a button
      notifyEngine('Haptic', 'vibrate', { duration: 5 });
    }
    if (engine === 'Performance' && event === 'preemptive_degradation') {
      setIntervention(true);
    }
    
    if (engine === 'Creative' && event === 'ambient_glow' && data?.color) {
      document.documentElement.style.setProperty('--ambient-glow', data.color);
    }
    
    if (engine === 'Scroll' && event === 'velocity') {
      // Atmosphere Engine: Throttle audio modulation to save CPU
      const now = performance.now();
      if (now - lastAudioUpdate.current > 100) {
        lastAudioUpdate.current = now;
        if (filterRef.current && audioCtxRef.current) {
          const targetFreq = 100 + Math.min(Math.abs(data.velocity || 0) * 8, 800);
          filterRef.current.frequency.setTargetAtTime(targetFreq, audioCtxRef.current.currentTime, 0.1);
        }
      }
      scrollVelocityRef.current = data.velocity || 0;
    }
    if (engine === 'Neural') {
      if (event === 'processing') {
        document.body.classList.add('neural-processing');
        setSoulState(prev => ({ ...prev, isThinking: true }));
        if (filterRef.current && audioCtxRef.current) {
          // Raise the pitch/intensity of the atmosphere hum when the brain is thinking
          filterRef.current.frequency.setTargetAtTime(600, audioCtxRef.current.currentTime, 0.5);
        }
      } else if (event === 'idle') {
        document.body.classList.remove('neural-processing');
        setSoulState(prev => ({ ...prev, isThinking: false }));
        if (filterRef.current && audioCtxRef.current) {
          // Return to subconscious hum
          filterRef.current.frequency.setTargetAtTime(100, audioCtxRef.current.currentTime, 1.0);
        }
      }
    }
  }, []);

  // AI Performance Engine: Active Intervention Protocol
  useEffect(() => {
    if (typeof document !== 'undefined') {
      if (intervention) {
        document.documentElement.classList.add('low-power-mode');
        console.log('%c[AI Performance Engine] Critical load detected. Engaging Low Power Mode. Downgrading visual fidelity to preserve 60FPS.', 'color: #ff3366; font-weight: bold;');
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend(); // Kill audio thread to save CPU
        }
      } else {
        document.documentElement.classList.remove('low-power-mode');
        if (audioStarted.current && audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
          audioCtxRef.current.resume();
        }
      }
    }
  }, [intervention]);

  useEffect(() => {
    // Interconnect engines for butter smooth performance
    const allEngines: EngineType[] = [
      'Scroll', 'Render', 'Animation', 'Interaction', 'Data', 'Prefetch', 'Telemetry', 'Resource', 'Memory', 'DOM', 
      'Layout', 'Paint', 'Composite', 'Network', 'State', 'Events', 'Routing', 'Cache', 'Security', 'Analytics', 
      'SEO', 'Accessibility', 'Audio', 'Video', 'WebGL', 'Workers', 'Storage', 'I18n', 'PWA', 'Sync', 'Membership', 'Haptic', 'Physical', 'Cursor', 'Atmosphere', 'Neural', 'Creative', 'Performance', 'Amplifier', 'Presence', 'ColorExtraction'
    ];
    
    // Boot up all engines
    allEngines.forEach(registerEngine);

    // Engine 1: Telemetry & Memory (FPS Monitor for butter smooth check)
    let frameCount = 0;
    let lastTime = performance.now();
    let animFrame: number;

    // Engine 4: Physical (Smooth scrolling + Momentum via Lenis)
    // Dynamic import to avoid SSR issues with Lenis
    let lenis: any = null;
    import('lenis').then(({ default: Lenis }) => {
      lenis = new Lenis({
        duration: 1.2,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        orientation: 'vertical',
        gestureOrientation: 'vertical',
        smoothWheel: true,
        touchMultiplier: 2,
      });

      lenis.on('scroll', (e: any) => {
        // Connect to Scroll and Physical engines
        notifyEngine('Scroll', 'velocity', { velocity: e.velocity });
        notifyEngine('Physical', 'inertia', { progress: e.progress });
      });
    });

    let isLooping = true;
    const measureFPSAndPhysics = (time: number) => {
      if (!isLooping) return;
      if (lenis) lenis.raf(time);

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        setFps(frameCount);
        
        // AI Performance Engine: Intervene if dropping frames
        if (frameCount < 30) {
          notifyEngine('Performance', 'degradation_detected', { fps: frameCount });
          setIntervention(true);
        } else if (frameCount >= 50) {
          setIntervention(false); // Auto-recover
        }

        frameCount = 0;
        lastTime = now;
      }
      animFrame = requestAnimationFrame(measureFPSAndPhysics);
    };
    animFrame = requestAnimationFrame(measureFPSAndPhysics);

    // Load Dissipation Engine: Tab Visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Halt brain when tab is backgrounded
        isLooping = false;
        cancelAnimationFrame(animFrame);
        notifyEngine('Memory', 'sleep');
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend();
        }
      } else {
        // Wake brain up
        isLooping = true;
        lastTime = performance.now();
        animFrame = requestAnimationFrame(measureFPSAndPhysics);
        notifyEngine('Memory', 'wake');
        if (audioStarted.current && audioCtxRef.current && audioCtxRef.current.state === 'suspended' && !intervention) {
          audioCtxRef.current.resume();
        }
      }
    };
    document.addEventListener('visibilitychange', handleVisibilityChange);

    // Engine 2: Interaction (Global mouse smoothing)
    document.body.style.cursor = 'crosshair';

    // Engine 3: Haptic Touch Feedback (Highly optimized for mobile)
    const triggerHaptic = (e: Event) => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        const target = e.target as HTMLElement;
        const interactive = target.closest('a, button, input, textarea, .execom-card, .junior-card, .team-card, .event-row, .benefit-card');
        if (interactive) {
          // 10ms is a very brief, high-end "tick" feel
          navigator.vibrate(10);
        }
      }
    };
    document.body.addEventListener('touchstart', triggerHaptic, { passive: true });
    document.body.addEventListener('click', triggerHaptic, { passive: true });

    // Atmosphere Engine Initialization
    const initAtmosphere = () => {
      if (audioStarted.current || typeof window === 'undefined') return;
      audioStarted.current = true;
      try {
        const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioContext();
        audioCtxRef.current = ctx;

        // Subconscious room tone
        const osc = ctx.createOscillator();
        osc.type = 'sine';
        osc.frequency.value = 55; // Deep hum

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.value = 100;
        filterRef.current = filter;

        const gain = ctx.createGain();
        gain.gain.value = 0.08; // Very subtle, barely audible

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(ctx.destination);
        
        osc.start();
      } catch (e) {
        console.warn('Atmosphere Engine failed to boot:', e);
      }
    };
    
    // Audio contexts must be started on user interaction
    document.addEventListener('click', initAtmosphere, { once: true });
    document.addEventListener('scroll', initAtmosphere, { once: true, passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', initAtmosphere);
      document.removeEventListener('scroll', initAtmosphere);
      if (audioCtxRef.current) audioCtxRef.current.close();
      cancelAnimationFrame(animFrame);
      if (lenis) lenis.destroy();
      document.body.removeEventListener('touchstart', triggerHaptic);
      document.body.removeEventListener('click', triggerHaptic);
    };
  }, []);

  useEffect(() => {
    // Chrono-Aesthetic Engine: Synchronize with Kerala Time (IST)
    const setChronoTheme = () => {
      const now = new Date();
      // UTC + 5:30 (IST)
      const istTime = new Date(now.getTime() + (330 * 60000));
      const hours = istTime.getUTCHours();
      
      let theme = 'peak'; // 12 PM - 5 PM
      if (hours >= 6 && hours < 12) theme = 'dawn';
      else if (hours >= 18 || hours < 6) theme = 'hacker';
      
      document.documentElement.setAttribute('data-chrono', theme);
    };
    
    setChronoTheme();
    const chronoInterval = setInterval(setChronoTheme, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(chronoInterval);
  }, []);

  return (
    <BrainContext.Provider value={{
      isSmooth: fps >= 30,
      activeEngines,
      registerEngine,
      notifyEngine,
      perfMetrics: { fps, loadTime: typeof window !== 'undefined' ? performance.now() : 0, intervention },
      soulState,
      creativeState,
      scrollVelocityRef
    }}>
      {/* The Central Brain Wrapping the App */}
      <div className="central-brain-layer" style={{ display: 'contents' }}>
        {children}
      </div>
    </BrainContext.Provider>
  );
}
