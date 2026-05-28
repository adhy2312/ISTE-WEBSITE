'use client'

import { useEffect, useRef } from 'react'

interface HomeAnimationsProps {
  heroTypedText?: string
}

export default function HomeAnimations({ heroTypedText = "ISTE MBCET STUDENT'S CHAPTER" }: HomeAnimationsProps) {
  const tcursorRef = useRef<HTMLSpanElement | null>(null)
  const typedSpanRef = useRef<HTMLSpanElement | null>(null)
  const heroDividerRef = useRef<HTMLDivElement | null>(null)
  const heroSubRef = useRef<HTMLParagraphElement | null>(null)



  // Navbar Scroll
  useEffect(() => {
    const navbar = document.getElementById('navbar')
    if (!navbar) return
    let ticking = false
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 60)
          ticking = false
        })
        ticking = true
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Mobile hamburger menu
  useEffect(() => {
    const hamburger = document.getElementById('hamburger')
    const mobMenu   = document.getElementById('mob-menu')
    const mobClose  = document.getElementById('mob-close')
    if (!hamburger || !mobMenu || !mobClose) return

    const open = () => {
      mobMenu.classList.add('open')
      document.body.style.overflow = 'hidden'
    }
    const close = () => {
      mobMenu.classList.remove('open')
      document.body.style.overflow = ''
    }

    hamburger.addEventListener('click', open)
    mobClose.addEventListener('click', close)

    // Close on any mob-link click
    const links = mobMenu.querySelectorAll('.mob-link, .mob-cta')
    links.forEach(l => l.addEventListener('click', close))

    // Close on backdrop click
    mobMenu.addEventListener('click', (e) => {
      if (e.target === mobMenu) close()
    })

    return () => {
      hamburger.removeEventListener('click', open)
      mobClose.removeEventListener('click', close)
      links.forEach(l => l.removeEventListener('click', close))
    }
  }, [])

  // Hero Typing
  useEffect(() => {
    const typedSpan = document.getElementById('typed-out') as HTMLSpanElement | null
    const tcursor = document.getElementById('tcursor') as HTMLSpanElement | null
    const heroDivider = document.getElementById('hero-div') as HTMLDivElement | null
    const heroSub = document.getElementById('hero-sub') as HTMLParagraphElement | null

    let ti = 0
    if (!typedSpan) return
    typedSpan.textContent = ''

    const typeNext = () => {
      if (!typedSpan || !tcursor || !heroDivider || !heroSub) return
      if (ti < heroTypedText.length) {
        typedSpan.textContent += heroTypedText[ti++]
        setTimeout(typeNext, 50)
      } else {
        tcursor.style.animation = 'none'
        tcursor.style.opacity = '1'
        setTimeout(() => {
          tcursor.classList.add('gone')
          heroDivider.classList.add('open')
        }, 600)
        setTimeout(() => heroSub.classList.add('show'), 900)
      }
    }
    const t = setTimeout(typeNext, 1000)
    return () => clearTimeout(t)
  }, [heroTypedText])

  // Scroll Reveal and Count-Up
  useEffect(() => {
    let ro: IntersectionObserver | null = null;
    let co: IntersectionObserver | null = null;

    if (typeof IntersectionObserver !== 'undefined') {
      ro = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (e.isIntersecting) {
            e.target.classList.add('visible')
            ro?.unobserve(e.target)
          }
        })
      }, { threshold: 0, rootMargin: '0px 0px 200px 0px' })

      document.querySelectorAll('.reveal').forEach(el => ro?.observe(el))

      co = new IntersectionObserver(entries => {
        entries.forEach(e => {
          if (!e.isIntersecting) return
          const el = e.target as HTMLElement
          const targetAttr = el.getAttribute('data-to')
          if (!targetAttr) return
          const target = +targetAttr
          const dur = 1800
          let start: number | null = null
          const stepAnim = (timestamp: number) => {
            if (!start) start = timestamp
            const progress = timestamp - start
            const cur = Math.min(target * (progress / dur), target)
            el.textContent = Math.floor(cur).toString()
            if (progress < dur) {
              requestAnimationFrame(stepAnim)
            } else {
              el.textContent = target.toString()
            }
          }
          requestAnimationFrame(stepAnim)
          co?.unobserve(el)
        })
      }, { threshold: 0.5 })

      document.querySelectorAll('.countup').forEach(el => co?.observe(el))
    } else {
      // Fallback for older devices: just show the elements immediately
      document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'))
      document.querySelectorAll('.countup').forEach(el => {
        const targetAttr = el.getAttribute('data-to')
        if (targetAttr) el.textContent = targetAttr
      })
    }

    return () => {
      if (ro) ro.disconnect()
      if (co) co.disconnect()
    }
  }, [])

  // Holographic 3D Card Tilt Effect
  useEffect(() => {
    const cards = document.querySelectorAll('.execom-card, .team-card, .junior-card') as NodeListOf<HTMLElement>
    
    // Load Dissipation: RAF Lock for physics calculations
    let physicsLock = false;
    
    const handleMouseMove = (e: MouseEvent, card: HTMLElement) => {
      if (physicsLock) return;
      physicsLock = true;
      
      requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect()
        const x = e.clientX - rect.left
        const y = e.clientY - rect.top
        
        const centerX = rect.width / 2
        const centerY = rect.height / 2
        
        // Calculate rotation (max 3 degrees for subtle, professional Apple-like parallax)
        const rotateX = ((y - centerY) / centerY) * -3
        const rotateY = ((x - centerX) / centerX) * 3
        
        card.style.setProperty('--rx', `${rotateX}deg`)
        card.style.setProperty('--ry', `${rotateY}deg`)
        
        // Calculate glare position
        const px = (x / rect.width) * 100
        const py = (y / rect.height) * 100
        card.style.setProperty('--mx', `${px}%`)
        card.style.setProperty('--my', `${py}%`)
        
        physicsLock = false;
      });
    }
    
    const handleMouseLeave = (card: HTMLElement) => {
      card.style.setProperty('--rx', '0deg')
      card.style.setProperty('--ry', '0deg')
      card.style.setProperty('--mx', '50%')
      card.style.setProperty('--my', '50%')
    }
    
    const listeners = new Map()
    
    cards.forEach(card => {
      const move = (e: MouseEvent) => handleMouseMove(e, card)
      const leave = () => handleMouseLeave(card)
      
      card.addEventListener('mousemove', move)
      card.addEventListener('mouseleave', leave)
      listeners.set(card, { move, leave })
    })
    
    return () => {
      cards.forEach(card => {
        const { move, leave } = listeners.get(card) || {}
        if (move) card.removeEventListener('mousemove', move)
        if (leave) card.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

  return null // This component only runs effects, renders nothing
}
