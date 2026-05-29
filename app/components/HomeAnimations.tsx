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

  // Scroll Reveal and Count-Up using GSAP Premium Motion
  useGSAP(() => {
    // Cinematic Reveal Animations (Replacing generic reveals)
    const reveals = gsap.utils.toArray('.reveal');
    reveals.forEach((el: any) => {
      gsap.fromTo(el, 
        { y: 60, opacity: 0, scale: 0.98 }, 
        {
          y: 0, 
          opacity: 1, 
          scale: 1,
          duration: TIMING.reveal, 
          ease: EASING.premium,
          scrollTrigger: {
            trigger: el,
            start: "top 85%",
            once: true
          }
        }
      );
    });

    // Count-Up Animations
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

    // Editorial Typography System (Vanilla DOM splitting for static HTML)
    const cinematicTexts = gsap.utils.toArray('.cinematic-text') as HTMLElement[];
    cinematicTexts.forEach((el) => {
      // Split text into words manually
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
        wordSpan.style.willChange = 'transform';
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
  });

  // Holographic 3D Card Tilt Effect via GSAP
  useGSAP(() => {
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
