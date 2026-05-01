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

  // Custom Cursor
  useEffect(() => {
    const cdot = document.getElementById('cdot')
    const cring = document.getElementById('cring')
    if (!cdot || !cring) return

    let mx = -100, my = -100, rx = -100, ry = -100
    let req: number | null = null

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      if (!req) {
        req = requestAnimationFrame(animRing)
      }
    }

    const animRing = () => {
      cdot.style.transform = `translate3d(${mx}px, ${my}px, 0)`
      
      const dx = mx - rx
      const dy = my - ry
      
      if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
        rx = mx
        ry = my
        cring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
        req = null
        return
      }

      rx += dx * 0.12
      ry += dy * 0.12
      cring.style.transform = `translate3d(${rx}px, ${ry}px, 0)`
      req = requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', handleMouseMove)

    const interactiveEls = document.querySelectorAll('a, button, .execom-card, .event-row, .benefit-card, .who-card, .team-card')
    const enter = () => { 
      document.querySelector('.c-dot-inner')?.classList.add('big'); 
      document.querySelector('.c-ring-inner')?.classList.add('big'); 
    }
    const leave = () => { 
      document.querySelector('.c-dot-inner')?.classList.remove('big'); 
      document.querySelector('.c-ring-inner')?.classList.remove('big'); 
    }

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      if (req !== null) cancelAnimationFrame(req)
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', enter)
        el.removeEventListener('mouseleave', leave)
      })
    }
  }, [])

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
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible')
          ro.unobserve(e.target)
        }
      })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })

    document.querySelectorAll('.reveal').forEach(el => ro.observe(el))

    const co = new IntersectionObserver(entries => {
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
        co.unobserve(el)
      })
    }, { threshold: 0.5 })

    document.querySelectorAll('.countup').forEach(el => co.observe(el))

    return () => {
      ro.disconnect()
      co.disconnect()
    }
  }, [])

  return null // This component only runs effects, renders nothing
}
