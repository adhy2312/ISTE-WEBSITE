'use client'

import { useEffect, useRef } from 'react'
import { gsap, ScrollTrigger, useGSAP } from '../brain/engines/GSAPCore'
import { EASING, TIMING } from '../brain/engines/MotionTokens'

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

  // ── ALL GSAP SCROLL ANIMATIONS ──
  useGSAP(() => {
    // iOS guard: skip all ScrollTrigger work on iOS to prevent scroll jank
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (isIOS) return;

    // 1. Standard reveal animations (fade up on scroll)
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach((el: any) => {
      gsap.fromTo(el, 
        { y: 60, opacity: 0 }, 
        {
          y: 0, 
          opacity: 1, 
          duration: TIMING.reveal, 
          ease: EASING.premium,
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            once: true
          }
        }
      );
    });

    // 2. Count-Up Animations
    const countups = gsap.utils.toArray('.countup');
    countups.forEach((el: any) => {
      const targetAttr = el.getAttribute('data-to');
      if (!targetAttr) return;
      const target = +targetAttr;
      
      gsap.to(el, {
        innerHTML: target,
        duration: TIMING.cinematic,
        ease: EASING.cinematic,
        snap: { innerHTML: 1 },
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      });
    });

    // 3. Editorial Typography System
    const cinematicTexts = gsap.utils.toArray('.cinematic-text') as HTMLElement[];
    cinematicTexts.forEach((el) => {
      const text = el.innerText;
      el.innerHTML = '';
      const words = text.split(' ');
      
      words.forEach(word => {
        const wordWrapper = document.createElement('span');
        wordWrapper.style.display = 'inline-block';
        wordWrapper.style.overflow = 'hidden';
        wordWrapper.style.verticalAlign = 'top';
        
        const wordSpan = document.createElement('span');
        wordSpan.innerText = word + '\u00A0';
        wordSpan.style.display = 'inline-block';
        wordSpan.style.transform = 'translateY(110%)';
        wordSpan.className = 'cinematic-word';
        
        wordWrapper.appendChild(wordSpan);
        el.appendChild(wordWrapper);
      });

      const wordNodes = el.querySelectorAll('.cinematic-word');
      gsap.to(wordNodes, {
        y: '0%',
        duration: TIMING.reveal,
        ease: EASING.premium,
        stagger: 0.03,
        scrollTrigger: {
          trigger: el,
          start: "top 85%",
          once: true
        }
      });
    });

    // ── 4. HERO PARALLAX (lightweight, translate-only) ──
    const heroSection = document.querySelector('#hero');
    if (heroSection) {
      gsap.to('.orbital-lines', {
        y: 150,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
      gsap.to('.aurora-ribbon', {
        y: 200,
        opacity: 0.3,
        ease: 'none',
        scrollTrigger: {
          trigger: '#hero',
          start: 'top top',
          end: 'bottom top',
          scrub: true
        }
      });
    }

    // ── 5. EVENT ROWS — Horizontal slide-in from left ──
    const eventRows = gsap.utils.toArray('.event-row') as HTMLElement[];
    eventRows.forEach((row, i) => {
      gsap.fromTo(row,
        { x: -80, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: TIMING.base,
          ease: EASING.premium,
          scrollTrigger: {
            trigger: row,
            start: 'top 90%',
            once: true
          },
          delay: i * 0.06
        }
      );
    });

    // ── 6. SECTION TITLES — Slide in from right ──
    const sectionTitles = gsap.utils.toArray('.section-title') as HTMLElement[];
    sectionTitles.forEach((title) => {
      gsap.fromTo(title,
        { x: 60, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: TIMING.reveal,
          ease: EASING.cinematic,
          scrollTrigger: {
            trigger: title,
            start: 'top 88%',
            once: true
          }
        }
      );
    });

    // ── 7. BENEFIT CARDS — Staggered fade-up ──
    const benefitCards = gsap.utils.toArray('.benefit-card') as HTMLElement[];
    if (benefitCards.length > 0) {
      gsap.fromTo(benefitCards,
        { y: 60, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TIMING.base,
          ease: EASING.premium,
          stagger: 0.08,
          scrollTrigger: {
            trigger: '#benefits',
            start: 'top 80%',
            once: true
          }
        }
      );
    }

    // ── 8. STATS — Scale pop ──
    const statItems = gsap.utils.toArray('.stat-item') as HTMLElement[];
    if (statItems.length > 0) {
      gsap.fromTo(statItems,
        { scale: 0.8, opacity: 0 },
        {
          scale: 1,
          opacity: 1,
          duration: TIMING.base,
          ease: EASING.snap,
          stagger: 0.1,
          scrollTrigger: {
            trigger: '#stats',
            start: 'top 85%',
            once: true
          }
        }
      );
    }

    // ── 9. WHO CARDS — Slide in from alternating sides ──
    const whoCards = gsap.utils.toArray('.who-card') as HTMLElement[];
    whoCards.forEach((card, i) => {
      const fromX = i % 2 === 0 ? -60 : 60;
      gsap.fromTo(card,
        { x: fromX, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: TIMING.reveal,
          ease: EASING.premium,
          scrollTrigger: {
            trigger: card,
            start: 'top 88%',
            once: true
          }
        }
      );
    });

    // ── 10. CHOREOGRAPHED SECTION ENTRANCES (GSAP Showcase pattern) ──
    // Each major section's tag → title → body animate in a sequenced timeline
    const sections = ['#about', '#benefits', '#execom', '#events', '#membership'];
    sections.forEach(sectionId => {
      const section = document.querySelector(sectionId);
      if (!section) return;

      const tag = section.querySelector('.section-tag');
      const title = section.querySelector('.section-title');
      const body = section.querySelector('.section-body');

      if (tag || title) {
        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: section,
            start: 'top 80%',
            once: true
          }
        });

        if (tag) {
          tl.fromTo(tag, 
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, ease: EASING.premium }
          );
        }
        if (title) {
          tl.fromTo(title,
            { y: 30, opacity: 0 },
            { y: 0, opacity: 1, duration: TIMING.base, ease: EASING.cinematic },
            '-=0.3' // Overlap with tag
          );
        }
        if (body) {
          tl.fromTo(body,
            { y: 20, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: EASING.premium },
            '-=0.4'
          );
        }
      }
    });

    // ── 11. EXECOM CARDS — Cascade reveal ──
    const execomCards = gsap.utils.toArray('.execom-card') as HTMLElement[];
    if (execomCards.length > 0) {
      gsap.fromTo(execomCards,
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: TIMING.base,
          ease: EASING.premium,
          stagger: 0.06,
          scrollTrigger: {
            trigger: '#execom',
            start: 'top 75%',
            once: true
          }
        }
      );
    }

    // ── 12. TESTIMONIAL CARDS — Subtle scale-in on visibility ──
    const testiCards = gsap.utils.toArray('.testi-card') as HTMLElement[];
    if (testiCards.length > 0) {
      gsap.fromTo(testiCards,
        { scale: 0.95, opacity: 0.5 },
        {
          scale: 1,
          opacity: 1,
          duration: TIMING.base,
          ease: EASING.premium,
          stagger: 0.05,
          scrollTrigger: {
            trigger: '#testimonials',
            start: 'top 85%',
            once: true
          }
        }
      );
    }

  });

  // Holographic 3D Card Tilt Effect via GSAP (desktop only)
  useGSAP(() => {
    // Skip on touch devices
    if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

    const cards = gsap.utils.toArray('.execom-card, .team-card, .junior-card') as HTMLElement[];
    
    cards.forEach(card => {
      card.addEventListener('mousemove', (e: MouseEvent) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        const rotateX = ((y - centerY) / centerY) * -3;
        const rotateY = ((x - centerX) / centerX) * 3;
        const px = (x / rect.width) * 100;
        const py = (y / rect.height) * 100;

        gsap.to(card, {
          '--rx': `${rotateX}deg`,
          '--ry': `${rotateY}deg`,
          '--mx': `${px}%`,
          '--my': `${py}%`,
          duration: TIMING.base,
          ease: EASING.premium,
          overwrite: "auto"
        });
      });
      
      card.addEventListener('mouseleave', () => {
        gsap.to(card, {
          '--rx': '0deg',
          '--ry': '0deg',
          '--mx': '50%',
          '--my': '50%',
          duration: TIMING.reveal,
          ease: EASING.premium,
          overwrite: "auto"
        });
      });
    });
  });

  return null // This component only runs effects, renders nothing
}
