'use client'
import React, { useEffect, useRef } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useBrain } from '../brain/BrainProvider'

export default function MagneticCursor() {
  const dotRef = useRef<HTMLDivElement>(null)
  const ringRef = useRef<HTMLDivElement>(null)
  const brain = useBrain()
  const notifyEngine = brain.notifyEngine
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    const isTouch = typeof window !== 'undefined' && (window.innerWidth <= 768 || 'ontouchstart' in window || navigator.maxTouchPoints > 0);
    if (isTouch) {
      if (dotRef.current) dotRef.current.style.display = 'none';
      if (ringRef.current) ringRef.current.style.display = 'none';
      return;
    }

    const dot = dotRef.current
    const ring = ringRef.current
    if (!dot || !ring) return

    let mouseX = window.innerWidth / 2
    let mouseY = window.innerHeight / 2
    let ringX = mouseX
    let ringY = mouseY
    
    let isHovering = false

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
      
      // Dot moves instantly for natural precision
      dot.style.transform = `translate3d(${mouseX - 3}px, ${mouseY - 3}px, 0)`
    }

    let interactables: NodeListOf<Element> = document.querySelectorAll('a, button, input, textarea, .execom-card, .junior-card, .team-card, .event-row, .benefit-card, .assistant-dock-btn, .internship-card, .intern-apply-btn, .launchpad-preview-card')

    const onMouseEnter = (e: Event) => {
      isHovering = true
      dot.style.opacity = '0'
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.background = 'rgba(255, 255, 255, 1)'
      ring.style.border = 'none'
      notifyEngine('Cursor', 'snap')

      // Predictive Routing: Zero-Latency Prefetch
      const el = e.currentTarget as HTMLElement
      if (el.tagName === 'A') {
        const href = el.getAttribute('href')
        if (href && href.startsWith('/')) {
          notifyEngine('Prefetch', 'predictive_route', { url: href })
          router.prefetch(href)
        }
      }
    }

    const onMouseLeave = () => {
      isHovering = false
      dot.style.opacity = '1'
      ring.style.width = '36px'
      ring.style.height = '36px'
      ring.style.background = 'transparent'
      ring.style.border = '1px solid rgba(255, 255, 255, 0.5)'
    }

    const bindEvents = () => {
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
        
        el.addEventListener('mouseenter', onMouseEnter)
        el.addEventListener('mouseleave', onMouseLeave)
      })
    }
    
    bindEvents()

    let raf: number;
    const loop = () => {
      // Fluid lerp for the outer ring
      ringX += (mouseX - ringX) * 0.2
      ringY += (mouseY - ringY) * 0.2
      
      const size = 36;
      ring.style.transform = `translate3d(${ringX - size/2}px, ${ringY - size/2}px, 0)`

      raf = requestAnimationFrame(loop)
    }
    
    raf = requestAnimationFrame(loop)
    window.addEventListener('mousemove', onMouseMove)

    const style = document.createElement('style')
    style.innerHTML = `* { cursor: none !important; }`
    document.head.appendChild(style)

    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      cancelAnimationFrame(raf)
      interactables.forEach(el => {
        el.removeEventListener('mouseenter', onMouseEnter)
        el.removeEventListener('mouseleave', onMouseLeave)
      })
      if (document.head.contains(style)) {
        document.head.removeChild(style)
      }
    }
  }, [pathname, router, notifyEngine])

  return (
    <>
      <div 
        ref={dotRef}
        style={{
          position: 'fixed', top: 0, left: 0, width: '6px', height: '6px',
          background: 'white', borderRadius: '50%', pointerEvents: 'none',
          zIndex: 10001, mixBlendMode: 'difference',
          transition: 'opacity 0.2s ease',
        }}
      />
      <div 
        ref={ringRef} 
        style={{
          position: 'fixed', top: 0, left: 0, width: '36px', height: '36px',
          border: '1px solid rgba(255, 255, 255, 0.5)', borderRadius: '50%', pointerEvents: 'none',
          zIndex: 10000, mixBlendMode: 'difference',
          transition: 'width 0.3s cubic-bezier(0.19, 1, 0.22, 1), height 0.3s cubic-bezier(0.19, 1, 0.22, 1), background 0.3s',
        }}
      />
    </>
  )
}
