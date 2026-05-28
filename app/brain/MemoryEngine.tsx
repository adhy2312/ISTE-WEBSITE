'use client'

/**
 * MEMORY ENGINE — Interaction Memory & Environmental Familiarity
 *
 * Philosophy: Not tracking. Not surveillance. Environmental familiarity.
 * Like walking into a room that recognizes you — the lights are already at
 * your preferred level, the music is softer, things feel less sharp.
 *
 * All data stored in localStorage only. No server. No cookies. No PII.
 * The organism simply remembers how you move, and adapts its skin accordingly.
 *
 * What it tracks:
 *   - visitCount           → soul becomes calmer on repeat visits
 *   - totalTimeSpent       → motion intensity reduces for engaged visitors
 *   - sectionsExplored     → homepage evolves (subtle glow on visited sections)
 *   - motionProfile        → fast/slow user style → adapts animation speed
 *   - assistantTopics      → assistant remembers what you've asked before
 *   - lastVisit            → time-aware greetings and atmospheric shift
 */

import { useEffect, useRef } from 'react'
import { useBrain } from './BrainProvider'

export interface MemoryProfile {
  visitCount: number           // How many times they've returned
  totalTimeSpent: number       // Cumulative seconds across all sessions
  lastVisit: number            // Unix timestamp
  sectionsExplored: string[]   // Which page sections they've scrolled into
  motionStyle: 'fast' | 'slow' | 'moderate'  // Their movement profile
  assistantTopics: string[]    // Topics asked to the AI assistant
  familiarity: 'new' | 'returning' | 'familiar' | 'home'  // Derived level
}

const MEMORY_KEY = 'iste_organism_memory'
const SESSION_START = Date.now()

function readMemory(): MemoryProfile {
  try {
    const raw = localStorage.getItem(MEMORY_KEY)
    if (!raw) return createFreshMemory()
    return JSON.parse(raw) as MemoryProfile
  } catch {
    return createFreshMemory()
  }
}

function createFreshMemory(): MemoryProfile {
  return {
    visitCount: 0,
    totalTimeSpent: 0,
    lastVisit: 0,
    sectionsExplored: [],
    motionStyle: 'moderate',
    assistantTopics: [],
    familiarity: 'new'
  }
}

function deriveFamiliarity(profile: MemoryProfile): MemoryProfile['familiarity'] {
  if (profile.visitCount === 0) return 'new'
  if (profile.visitCount <= 2) return 'returning'
  if (profile.visitCount <= 7) return 'familiar'
  return 'home'
}

function writeMemory(profile: MemoryProfile) {
  try {
    localStorage.setItem(MEMORY_KEY, JSON.stringify(profile))
  } catch {
    // Storage quota exceeded or private mode — fail silently
  }
}

export function readMemoryProfile(): MemoryProfile {
  if (typeof window === 'undefined') return createFreshMemory()
  return readMemory()
}

export default function MemoryEngine() {
  const brain = useBrain()
  const notifyRef = useRef(brain.notifyEngine)
  const registerRef = useRef(brain.registerEngine)
  const profileRef = useRef<MemoryProfile>(createFreshMemory())

  useEffect(() => { notifyRef.current = brain.notifyEngine })
  useEffect(() => { registerRef.current = brain.registerEngine })

  useEffect(() => {
    registerRef.current('Memory')

    // ── 1. Load memory profile ──────────────────────────────────
    const profile = readMemory()

    // Increment visit count and record timestamp
    profile.visitCount += 1
    profile.lastVisit = SESSION_START
    profile.familiarity = deriveFamiliarity(profile)
    profileRef.current = profile

    // Apply familiarity to the CSS cascade immediately
    applyFamiliarityCSS(profile)

    // ── 2. Section observer — only watch major named sections ──────
    const MAJOR_SECTIONS = ['hero', 'about', 'who', 'benefits', 'execom', 'events', 'membership']
    let sectionObserver: IntersectionObserver | null = null;
    
    if (typeof IntersectionObserver !== 'undefined') {
      sectionObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const id = (entry.target as HTMLElement).id
            if (id && !profile.sectionsExplored.includes(id)) {
              profile.sectionsExplored.push(id)
              profileRef.current = profile
            }
          }
        })
      }, { threshold: 0.3 })

      MAJOR_SECTIONS.forEach(id => {
        const el = document.getElementById(id)
        if (el) sectionObserver?.observe(el)
      })
    }

    // ── 3. Motion style detector — fast vs slow user ────────────
    let mouseEvents = 0
    let fastEvents = 0
    let lastMouseTime = 0

    const detectMotionStyle = () => {
      const now = Date.now()
      const delta = now - lastMouseTime
      mouseEvents++
      if (delta < 50) fastEvents++ // Fast movement = < 50ms between events
      lastMouseTime = now

      // Sample after 30 mouse events, then determine style
      if (mouseEvents === 30) {
        const fastRatio = fastEvents / mouseEvents
        if (fastRatio > 0.6) {
          profile.motionStyle = 'fast'
        } else if (fastRatio < 0.2) {
          profile.motionStyle = 'slow'
        } else {
          profile.motionStyle = 'moderate'
        }
        document.documentElement.setAttribute('data-motion', profile.motionStyle)
        // Reset for next sample
        mouseEvents = 0
        fastEvents = 0
      }
    }

    window.addEventListener('mousemove', detectMotionStyle, { passive: true })

    // ── 4. Save time spent on exit ───────────────────────────────
    const saveSessionTime = () => {
      const sessionSeconds = Math.round((Date.now() - SESSION_START) / 1000)
      profile.totalTimeSpent += sessionSeconds
      profile.familiarity = deriveFamiliarity(profile)
      writeMemory(profile)
    }

    // Save on tab hide or window unload
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) saveSessionTime()
    })
    window.addEventListener('beforeunload', saveSessionTime)

    // ── 5. Periodic save (every 30s) ─────────────────────────────
    const saveInterval = setInterval(saveSessionTime, 30000)

    // ── 6. Notify other engines of familiarity level ─────────────
    // This lets Digital Soul, Atmosphere, and NeuralNetwork adapt
    notifyRef.current('Memory', profile.familiarity === 'home' ? 'wake' : 'boot', {
      familiarity: profile.familiarity,
      visitCount: profile.visitCount,
      totalTimeSpent: profile.totalTimeSpent,
      motionStyle: profile.motionStyle
    })

    // Log the organism's memory state (visible in DevTools for contributors)
    console.log(
      `%c[Memory Engine] Visitor Profile Loaded`,
      'color: #a78bfa; font-weight: bold;',
      `\n  Familiarity: ${profile.familiarity}`,
      `\n  Visit #${profile.visitCount}`,
      `\n  Time Spent: ${Math.round(profile.totalTimeSpent / 60)}min total`,
      `\n  Sections Seen: ${profile.sectionsExplored.join(', ') || 'none yet'}`,
      `\n  Motion Style: ${profile.motionStyle}`
    )

    return () => {
      if (sectionObserver) sectionObserver.disconnect()
      window.removeEventListener('mousemove', detectMotionStyle)
      window.removeEventListener('beforeunload', saveSessionTime)
      clearInterval(saveInterval)
      saveSessionTime()
    }
  }, [])

  return null
}

// ─────────────────────────────────────────────────────────────
// Apply familiarity-based CSS attributes to <html>
// These drive the organism's environmental adaptation
// ─────────────────────────────────────────────────────────────
function applyFamiliarityCSS(profile: MemoryProfile) {
  const root = document.documentElement
  root.setAttribute('data-familiarity', profile.familiarity)
  root.setAttribute('data-motion', profile.motionStyle)
  root.setAttribute('data-visits', String(Math.min(profile.visitCount, 10)))
}
