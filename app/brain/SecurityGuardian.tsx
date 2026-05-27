'use client';

import { useEffect, useRef } from 'react';
import { useBrain } from './BrainProvider';

/**
 * ENGINE 43: SECURITY GUARDIAN
 * 
 * An autonomous cybersecurity layer that operates as the organism's immune system.
 * It monitors for:
 * 1. Unauthorized script injections (XSS)
 * 2. Rapid bot-like interactions (DDoS / Scraper behavior)
 * 3. Malicious payload typing (SQLi / XSS heuristics)
 * 4. Anti-Tampering (Blocks DevTools, Inspect Element, Right-Click, Source View)
 * 5. Data Protection (Blocks Copying, Dragging)
 * 
 * When a threat is detected, it triggers the organism's stress response and
 * can lockdown critical systems.
 */

const THREAT_PATTERNS = [
  /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
  /javascript:/gi,
  /onerror\s*=/gi,
  /onload\s*=/gi,
  /SELECT\s+.*?\s+FROM/gi,
  /UNION\s+SELECT/gi,
  /DROP\s+TABLE/gi
];

export default function SecurityGuardian() {
  const brain = useBrain();
  const interactionHistory = useRef<number[]>([]);
  const isLockedDown = useRef(false);

  useEffect(() => {
    brain.registerEngine('Security');

    // ── 1. DOM IMMUNE SYSTEM (Mutation Observer) ───────────────────────
    // Watches the DOM for unauthorized script injections
    const observer = new MutationObserver((mutations) => {
      if (isLockedDown.current) return;
      
      for (const mutation of mutations) {
        for (const node of Array.from(mutation.addedNodes)) {
          if (node.nodeName.toLowerCase() === 'script') {
            const scriptNode = node as HTMLScriptElement;
            // Ignore standard Next.js / trusted scripts
            if (!scriptNode.src.includes('_next') && !scriptNode.src.includes('vercel')) {
              handleThreat('UNAUTHORIZED_SCRIPT_INJECTION', `Detected unknown script: ${scriptNode.src || 'inline'}`);
              scriptNode.remove(); // Neutralize threat immediately
            }
          }
        }
      }
    });
    observer.observe(document.documentElement, { childList: true, subtree: true });

    // ── 2. BOT/SCRAPER DETECTION (Behavioral Rate Limiting) ───────────
    const handleInteraction = () => {
      if (isLockedDown.current) return;
      const now = Date.now();
      interactionHistory.current.push(now);
      
      // Keep only last 10 interactions
      if (interactionHistory.current.length > 10) {
        interactionHistory.current.shift();
      }

      // If 10 interactions happened in less than 500ms, it's a bot
      if (interactionHistory.current.length === 10) {
        const timeDelta = now - interactionHistory.current[0];
        if (timeDelta < 500) {
          handleThreat('BOT_BEHAVIOR_DETECTED', `Impossibly fast interactions (${timeDelta}ms for 10 actions)`);
        }
      }
    };
    window.addEventListener('click', handleInteraction);
    window.addEventListener('keydown', handleInteraction);

    // ── 3. MALICIOUS PAYLOAD SENSOR (Input Monitoring) ────────────────
    const handleInput = (e: Event) => {
      if (isLockedDown.current) return;
      const target = e.target as HTMLInputElement | HTMLTextAreaElement;
      if (target && target.value) {
        const value = target.value;
        for (const pattern of THREAT_PATTERNS) {
          if (pattern.test(value)) {
            handleThreat('MALICIOUS_PAYLOAD', `Detected attack signature: ${pattern}`);
            target.value = ''; // Clear payload
            break;
          }
        }
      }
    };
    // Use capture phase to intercept before React state updates
    window.addEventListener('input', handleInput, true);

    // ── 4. ANTI-TAMPERING / ANTI-DEBUGGING PROTOCOLS ──────────────────
    const preventAction = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
      handleThreat('ANTI_TAMPER', 'Unauthorized inspection or data extraction attempt blocked.');
      return false;
    };

    const handleKeydown = (e: KeyboardEvent) => {
      // Block F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+Shift+C, Ctrl+U
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
        (e.ctrlKey && e.key === 'u') ||
        (e.metaKey && e.altKey && (e.key === 'i' || e.key === 'j' || e.key === 'c')) ||
        (e.metaKey && e.key === 'u')
      ) {
        preventAction(e);
      }
    };

    window.addEventListener('contextmenu', preventAction); // Block right click
    window.addEventListener('keydown', handleKeydown, true); // Block DevTools shortcuts
    window.addEventListener('copy', preventAction); // Block copying
    window.addEventListener('cut', preventAction); // Block cutting
    window.addEventListener('dragstart', preventAction); // Block dragging images/text

    // ── THREAT RESPONSE PROTOCOL ──────────────────────────────────────
    const handleThreat = (type: string, details: string) => {
      isLockedDown.current = true;
      console.warn(`%c[SECURITY GUARDIAN] THREAT NEUTRALIZED ⚠️`, 'color: #ff0000; font-size: 14px; font-weight: bold;');
      console.warn(`Type: ${type}\nDetails: ${details}`);
      
      // Dispatch stress response to organism
      brain.notifyEngine('Security', 'threat_detected', { type, details });
      
      // Visually stress the organism (CSS override)
      document.documentElement.setAttribute('data-emotion', 'stressed');
      document.documentElement.setAttribute('data-security-lockdown', 'true');

      // Auto-recover after 10 seconds
      setTimeout(() => {
        isLockedDown.current = false;
        document.documentElement.removeAttribute('data-security-lockdown');
        document.documentElement.setAttribute('data-emotion', 'calm');
        console.log('%c[SECURITY GUARDIAN] Lockdown lifted. Returning to monitoring state.', 'color: #00ff00;');
      }, 10000);
    };

    return () => {
      observer.disconnect();
      window.removeEventListener('click', handleInteraction);
      window.removeEventListener('keydown', handleInteraction);
      window.removeEventListener('input', handleInput, true);
      window.removeEventListener('contextmenu', preventAction);
      window.removeEventListener('keydown', handleKeydown, true);
      window.removeEventListener('copy', preventAction);
      window.removeEventListener('cut', preventAction);
      window.removeEventListener('dragstart', preventAction);
    };
  }, []); // Remove brain from dependencies to prevent infinite loops

  return null;
}
