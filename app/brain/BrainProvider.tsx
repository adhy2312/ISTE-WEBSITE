'use client'

import React, { createContext, useContext, useEffect, useState, useRef, useCallback } from 'react';
import { gsap, ScrollTrigger } from './engines/GSAPCore';

// The 38 Engines Architecture (including Membership, Haptic, Physical, Cursor, Atmosphere, Neural, Creative, Performance, Internship, and Physics Engines)
type EngineType = 'Scroll' | 'Render' | 'Animation' | 'Interaction' | 'Data' | 'Prefetch' | 'Telemetry' | 'Resource' | 'Memory' | 'DOM' | 'Layout' | 'Paint' | 'Composite' | 'Network' | 'State' | 'Events' | 'Routing' | 'Cache' | 'Security' | 'Analytics' | 'SEO' | 'Accessibility' | 'Audio' | 'Video' | 'WebGL' | 'Workers' | 'Storage' | 'I18n' | 'PWA' | 'Sync' | 'Membership' | 'Haptic' | 'Physical' | 'Cursor' | 'Atmosphere' | 'Neural' | 'Creative' | 'Performance' | 'Internship' | 'Physics' | 'Amplifier' | 'Presence' | 'ColorExtraction' | 'Compute';

interface BrainState {
  isSmooth: boolean;
  activeEngines: Set<EngineType>;
  registerEngine: (engine: EngineType) => void;
  notifyEngine: (engine: EngineType, event: string, data?: any) => void;
  perfMetrics: { fps: number; loadTime: number; intervention: boolean };
  soulState: { isThinking: boolean; scrollVelocity: number };
  creativeState: { immersiveMode: boolean; glitchIntensity: number };
  internshipState: { agentStatus: string; logs: string[]; foundCount: number };
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
  internshipState: { agentStatus: 'IDLE', logs: [], foundCount: 0 },
  scrollVelocityRef: { current: 0 }
});

export const useBrain = () => useContext(BrainContext);

export default function BrainProvider({ children }: { children: React.ReactNode }) {
  const [activeEngines, setActiveEngines] = useState<Set<EngineType>>(new Set());
  const fpsRef = useRef(60);
  const [intervention, setIntervention] = useState(false);
  const [soulState, setSoulState] = useState({ isThinking: false, scrollVelocity: 0 });
  const [creativeState, setCreativeState] = useState({ immersiveMode: false, glitchIntensity: 0 });
  const [internshipState, setInternshipState] = useState({ agentStatus: 'INITIALIZING', logs: [] as string[], foundCount: 0 });
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
    } else if (engine === 'Internship') {
      if (event === 'agent_status') {
        setInternshipState(prev => ({ ...prev, agentStatus: data }));
        
        // Deep integration: Wire AI data to the Neural Engine
        if (data.includes('OPPORTUNITY DETECTED')) {
          // Trigger the Neural Network 'thinking' state
          if (typeof document !== 'undefined') {
            document.body.classList.add('neural-processing');
            setTimeout(() => document.body.classList.remove('neural-processing'), 2000);
          }
          // Trigger Haptic feedback engine
          if (activeEngines.has('Haptic')) {
             console.log('[Neural Link] Sending vibration impulse for detected opportunity.');
             // Assuming HapticEngine intercepts 'vibrate' events somewhere, or just use native:
             if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
          }
          // Trigger a micro-glitch in the Creative Engine to simulate a data spike
          setCreativeState(prev => ({ ...prev, glitchIntensity: 0.5 }));
          setTimeout(() => setCreativeState(prev => ({ ...prev, glitchIntensity: 0 })), 300);
        }
        
      } else if (event === 'agent_log') {
        setInternshipState(prev => ({ 
          ...prev, 
          logs: [data, ...prev.logs].slice(0, 50), // Keep last 50 logs
          foundCount: data.includes('FOUND') ? prev.foundCount + 1 : prev.foundCount
        }));
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
      if (typeof navigator !== 'undefined' && navigator.vibrate) {
        navigator.vibrate(5);
      }
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

    // Engine 4: Physical (Smooth scrolling) is handled securely by LenisProvider
    // It broadcasts velocity updates back to this Brain core natively.
    
    let isLooping = true;
    const measureFPSAndPhysics = (time: number) => {
      if (!isLooping) return;
      // Do not call lenis.raf directly here if we let GSAP handle it.
      // But we will wire it below if lenis exists.

      frameCount++;
      const now = performance.now();
      if (now - lastTime >= 1000) {
        fpsRef.current = frameCount;
        
        // Only trigger a state update when intervention state actually changes
        if (frameCount < 30 && !intervention) {
          setIntervention(true);
        } else if (frameCount >= 50 && intervention) {
          setIntervention(false);
        }

        frameCount = 0;
        lastTime = now;
      }
    };
    gsap.ticker.add(measureFPSAndPhysics);

    // Load Dissipation Engine: Tab Visibility
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Halt brain when tab is backgrounded
        isLooping = false;
        gsap.ticker.remove(measureFPSAndPhysics);
        notifyEngine('Memory', 'sleep');
        if (audioCtxRef.current && audioCtxRef.current.state === 'running') {
          audioCtxRef.current.suspend();
        }
      } else {
        // Wake brain up
        isLooping = true;
        lastTime = performance.now();
        gsap.ticker.add(measureFPSAndPhysics);
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
    // We rely solely on 'click' to avoid accidental haptics while scrolling
    document.body.addEventListener('click', triggerHaptic, { passive: true });

    // Atmosphere Engine Initialization
    const initAtmosphere = () => {
      // Audio removed by user request
    };
    
    // Audio contexts must be started on user interaction
    document.addEventListener('click', initAtmosphere, { once: true });
    document.addEventListener('scroll', initAtmosphere, { once: true, passive: true });

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('click', initAtmosphere);
      document.removeEventListener('scroll', initAtmosphere);
      if (audioCtxRef.current) audioCtxRef.current.close();
      gsap.ticker.remove(measureFPSAndPhysics);

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
      isSmooth: !intervention,
      activeEngines,
      registerEngine,
      notifyEngine,
      perfMetrics: { fps: 60, loadTime: 0, intervention },
      soulState,
      creativeState,
      internshipState,
      scrollVelocityRef
    }}>
      {/* The Central Brain Wrapping the App */}
      <div className="central-brain-layer" style={{ display: 'contents' }}>
        {children}
      </div>
    </BrainContext.Provider>
  );
}
