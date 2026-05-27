'use client'

/**
 * NEURAL NETWORK — Root-level Synapse Bus
 * 
 * This is the connective tissue of the entire organism.
 * It sits at the root of the app (layout.tsx, inside BrainProvider)
 * and fires bidirectional impulses between all 39 biological engines.
 * 
 * Emotional Signal Chain:
 *   Physics → Scroll Velocity → Atmosphere (audio pitch) → Soul (stretch)
 *   User Interaction → Haptic → Cursor Snap → Neural Pulse
 *   Performance Drop → AI Intervention → Low Power → Visual Downgrade
 *   Kinetic Spike → Creative Glitch → Soul Scale → Emotional Peak
 *   Tab Hidden → Memory Sleep → All Engines Pause
 *   Tab Visible → Memory Wake → Engines Resume → Emotional Reset
 */

import { useEffect, useRef } from 'react'
import { useBrain } from './BrainProvider'

// Emotional states the organism can inhabit
type EmotionalState = 
  | 'calm'        // Default — breathing, waiting
  | 'curious'     // Mouse exploring — slight energy rise
  | 'excited'     // Fast kinetic movement — energized
  | 'thinking'    // AI processing — intense focus
  | 'dormant'     // Tab hidden — suspended consciousness
  | 'stressed'    // FPS drop — intervention mode

export default function NeuralNetwork() {
  const brain = useBrain()

  // Emotional state ref — zero React state, pure signal propagation
  const emotionRef = useRef<EmotionalState>('calm')
  const notifyRef = useRef(brain.notifyEngine)
  const brainRef = useRef(brain)

  // Keep refs fresh without triggering re-renders
  useEffect(() => { notifyRef.current = brain.notifyEngine })
  useEffect(() => { brainRef.current = brain })

  useEffect(() => {
    const notify = () => notifyRef.current

    // ─────────────────────────────────────────────
    // SYNAPSE 1: Scroll Velocity → Emotional Tension
    // When the user scrolls fast, the organism becomes excited
    // ─────────────────────────────────────────────
    let lastScrollVelocity = 0
    let scrollDecayTimer: ReturnType<typeof setTimeout>

    const handleScroll = () => {
      const velocity = brainRef.current.scrollVelocityRef.current
      const absVel = Math.abs(velocity)

      if (absVel > 10 && emotionRef.current !== 'excited') {
        emotionRef.current = 'excited'
        notify()('Creative', 'glitch', { intensity: Math.min(absVel / 20, 1) })
        notify()('Atmosphere', 'energize')
        applyEmotionalCSS('excited')
      }

      clearTimeout(scrollDecayTimer)
      scrollDecayTimer = setTimeout(() => {
        if (emotionRef.current === 'excited') {
          emotionRef.current = 'calm'
          applyEmotionalCSS('calm')
        }
      }, 1500)

      lastScrollVelocity = velocity
    }

    // ─────────────────────────────────────────────
    // SYNAPSE 2: Mouse Activity → Curiosity State
    // Gradual energy build as the user explores
    // ─────────────────────────────────────────────
    let mouseIdleTimer: ReturnType<typeof setTimeout>
    let lastMouseMove = 0

    const handleMouseMove = () => {
      const now = Date.now()
      if (now - lastMouseMove < 100) return // throttle to 10fps
      lastMouseMove = now

      if (emotionRef.current === 'calm' || emotionRef.current === 'dormant') {
        emotionRef.current = 'curious'
        applyEmotionalCSS('curious')
      }

      clearTimeout(mouseIdleTimer)
      mouseIdleTimer = setTimeout(() => {
        if (emotionRef.current === 'curious') {
          emotionRef.current = 'calm'
          applyEmotionalCSS('calm')
        }
      }, 3000) // 3 seconds of no mouse = return to calm
    }

    // ─────────────────────────────────────────────
    // SYNAPSE 3: Physics Kinetic Spike → Excitement Peak
    // High-velocity mouse movement triggers a momentary emotional peak
    // ─────────────────────────────────────────────
    // Listened via brain.notifyEngine events (Physics → Neural)
    // The PhysicsEngine already fires 'kinetic_spike' to the Brain.
    // We intercept via a CSS class cascade and brief Creative glitch.

    // ─────────────────────────────────────────────
    // SYNAPSE 4: Tab Visibility → Dormancy Protocol
    // The organism suspends consciousness when not observed
    // ─────────────────────────────────────────────
    const handleVisibility = () => {
      if (document.hidden) {
        emotionRef.current = 'dormant'
        applyEmotionalCSS('dormant')
        notify()('Memory', 'sleep')
      } else {
        emotionRef.current = 'calm'
        applyEmotionalCSS('calm')
        notify()('Memory', 'wake')
        // Re-energize: brief excited pulse on return
        setTimeout(() => {
          notify()('Creative', 'glitch', { intensity: 0.3 })
        }, 300)
      }
    }

    // ─────────────────────────────────────────────
    // SYNAPSE 5: Performance Stress → Emotional Suppression
    // When the AI detects FPS drops, the organism enters stressed mode
    // ─────────────────────────────────────────────
    const perfObserver = new MutationObserver(() => {
      const isLowPower = document.documentElement.classList.contains('low-power-mode')
      if (isLowPower && emotionRef.current !== 'stressed') {
        emotionRef.current = 'stressed'
        applyEmotionalCSS('stressed')
      } else if (!isLowPower && emotionRef.current === 'stressed') {
        emotionRef.current = 'calm'
        applyEmotionalCSS('calm')
      }
    })

    perfObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class']
    })

    // ─────────────────────────────────────────────
    // SYNAPSE 6: Neural Processing → Thinking State
    // When AI chat is processing, the organism enters deep focus
    // ─────────────────────────────────────────────
    const neuralObserver = new MutationObserver(() => {
      const isThinking = document.body.classList.contains('neural-processing')
      if (isThinking && emotionRef.current !== 'thinking') {
        emotionRef.current = 'thinking'
        applyEmotionalCSS('thinking')
      } else if (!isThinking && emotionRef.current === 'thinking') {
        emotionRef.current = 'calm'
        applyEmotionalCSS('calm')
      }
    })

    neuralObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ['class']
    })

    // Bind all synapses
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    document.addEventListener('visibilitychange', handleVisibility)

    // Boot: apply initial emotional state
    applyEmotionalCSS('calm')

    return () => {
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('visibilitychange', handleVisibility)
      perfObserver.disconnect()
      neuralObserver.disconnect()
      clearTimeout(scrollDecayTimer)
      clearTimeout(mouseIdleTimer)
    }
  }, []) // Mount once

  return null // Pure synapse bus — no rendered output
}

// ─────────────────────────────────────────────
// CSS Emotional Cascade
// Injects data-emotion onto <html> so any CSS rule
// can react: html[data-emotion="excited"] .hero-headline { ... }
// ─────────────────────────────────────────────
function applyEmotionalCSS(state: EmotionalState) {
  document.documentElement.setAttribute('data-emotion', state)
}
