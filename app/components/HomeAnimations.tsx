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

    let mx = 0, my = 0, rx = 0, ry = 0
    let req: number

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX
      my = e.clientY
      cdot.style.left = mx + 'px'
      cdot.style.top = my + 'px'
    }

    const animRing = () => {
      rx += (mx - rx) * 0.12
      ry += (my - ry) * 0.12
      cring.style.left = rx + 'px'
      cring.style.top = ry + 'px'
      req = requestAnimationFrame(animRing)
    }

    document.addEventListener('mousemove', handleMouseMove)
    req = requestAnimationFrame(animRing)

    const interactiveEls = document.querySelectorAll('a, button, .execom-card, .event-row, .benefit-card, .who-card, .team-card')
    const enter = () => { cdot.classList.add('big'); cring.classList.add('big') }
    const leave = () => { cdot.classList.remove('big'); cring.classList.remove('big') }

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', enter)
      el.addEventListener('mouseleave', leave)
    })

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      cancelAnimationFrame(req)
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
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
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
        const step = target / (dur / 16)
        let cur = 0
        const t = setInterval(() => {
          cur = Math.min(cur + step, target)
          el.textContent = Math.floor(cur).toString()
          if (cur >= target) {
            el.textContent = target.toString()
            clearInterval(t)
          }
        }, 16)
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
