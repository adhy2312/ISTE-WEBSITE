'use client'

import { useEffect, useRef } from 'react'
import { useBrain } from './BrainProvider'
import { gsap } from './engines/GSAPCore'

export default function PhysicsEngine() {
  const brain = useBrain()
  // Use a ref so the rAF loop can access latest brain.notifyEngine
  // without re-creating the entire effect on every brain re-render
  const notifyRef = useRef(brain.notifyEngine)
  const registerRef = useRef(brain.registerEngine)
  
  useEffect(() => {
    notifyRef.current = brain.notifyEngine
  })
  useEffect(() => {
    registerRef.current = brain.registerEngine
  })

  // Physics state — pure mutable ref, zero React state
  const physics = useRef({
    mouseX: 0,
    mouseY: 0,
    smoothX: 0,
    smoothY: 0,
    velX: 0,
    velY: 0,
    lastScrollY: 0,
    scrollVel: 0,
    tiltX: 0,
    tiltY: 0
  })

  // Run exactly once on mount — no brain in deps
  useEffect(() => {
    // Register this biological cell with the Central Brain (one-shot)
    registerRef.current('Physics')

    const state = physics.current

    const handleMouseMove = (e: MouseEvent) => {
      state.mouseX = e.clientX
      state.mouseY = e.clientY
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta != null && e.gamma != null) {
        state.tiltX = Math.min(Math.max(e.gamma, -45), 45) / 45
        state.tiltY = Math.min(Math.max(e.beta - 45, -45), 45) / 45
      }
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    try {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true })
    } catch (e) {
      console.warn('[PhysicsEngine] Device orientation not supported or restricted');
    }

    let kineticCooldown = 0
    let lastPhysicsTime = 0
    const PHYSICS_INTERVAL = 1000 / 30 // 30fps cap

    const loop = (time: number) => {
      // Throttle to 30fps
      if (time * 1000 - lastPhysicsTime < PHYSICS_INTERVAL) return
      lastPhysicsTime = time * 1000
      // Scroll velocity with friction decay
      const currentScroll = window.scrollY
      state.scrollVel = state.scrollVel * 0.8 + (currentScroll - state.lastScrollY) * 0.2
      state.lastScrollY = currentScroll

      // Mouse inertia (mass simulation)
      state.velX = (state.mouseX - state.smoothX) * 0.1
      state.velY = (state.mouseY - state.smoothY) * 0.1
      state.smoothX += state.velX
      state.smoothY += state.velY

      // Throttled kinetic spike notification (max once every 60 frames)
      kineticCooldown--
      if (kineticCooldown <= 0) {
        const speed = Math.sqrt(state.velX ** 2 + state.velY ** 2)
        if (speed > 30) {
          notifyRef.current('Physics', 'kinetic_spike', { speed })
          kineticCooldown = 60
        }
      }

    }

    gsap.ticker.add(loop)

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      try {
        window.removeEventListener('deviceorientation', handleOrientation)
      } catch(e) {}
      gsap.ticker.remove(loop)
    }
  }, []) // Empty deps — mounts once, never re-subscribes

  return null
}
