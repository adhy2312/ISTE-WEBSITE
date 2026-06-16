'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP, SplitText, ScrambleTextPlugin, Observer } from '../brain/engines/GSAPCore';
import { EASING, TIMING } from '../brain/engines/MotionTokens';

interface HomeAnimationsProps {
  heroTypedText?: string;
}

export default function HomeAnimations({ heroTypedText = "ISTE MBCET STUDENT'S CHAPTER" }: HomeAnimationsProps) {
  const container = useRef<HTMLDivElement>(null);

  // 1. Navbar & Mobile Menu Logic (Native DOM, high performance)
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          navbar.classList.toggle('scrolled', window.scrollY > 60);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    
    // Hamburger logic
    const hamburger = document.getElementById('hamburger');
    const mobMenu   = document.getElementById('mob-menu');
    const mobClose  = document.getElementById('mob-close');
    
    const openMenu = () => {
      mobMenu?.classList.add('open');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      mobMenu?.classList.remove('open');
      document.body.style.overflow = '';
    };

    hamburger?.addEventListener('click', openMenu);
    mobClose?.addEventListener('click', closeMenu);
    
    const links = mobMenu?.querySelectorAll('.mob-link, .mob-cta') || [];
    links.forEach(l => l.addEventListener('click', closeMenu));

    return () => {
      window.removeEventListener('scroll', handleScroll);
      hamburger?.removeEventListener('click', openMenu);
      mobClose?.removeEventListener('click', closeMenu);
      links.forEach(l => l.removeEventListener('click', closeMenu));
    };
  }, []);

  // 2. Hero Typing Logic (Powered by GSAP TextPlugin)
  useEffect(() => {
    const typedSpan = document.getElementById('typed-out');
    const tcursor = document.getElementById('tcursor');
    const heroDivider = document.getElementById('hero-div');
    const heroSub = document.getElementById('hero-sub');

    if (!typedSpan) return;
    typedSpan.textContent = ''; // clear initially

    const tl = gsap.timeline({ delay: 0.8 });
    
    // Type out the text elegantly
    tl.to(typedSpan, {
      text: heroTypedText,
      duration: heroTypedText.length * 0.04, // 40ms per character
      ease: "none",
    })
    // Stop cursor blinking and fade it out
    .add(() => {
      if (tcursor) {
        tcursor.style.animation = 'none';
        tcursor.style.opacity = '1';
        gsap.to(tcursor, { opacity: 0, duration: 0.6, delay: 0.6, onComplete: () => tcursor.classList.add('gone') });
      }
    })
    // Open divider and show subtext
    .add(() => {
      if (heroDivider) heroDivider.classList.add('open');
      setTimeout(() => {
        if (heroSub) heroSub.classList.add('show');
      }, 300);
    }, "+=0.6");

    return () => { tl.kill(); };
  }, [heroTypedText]);

  // 3. Premium GSAP Motion System (Refactored for iOS safety and maximum FPS)
  useGSAP(() => {
    // We use matchMedia to separate desktop (rich) from mobile (optimized)
    const mm = gsap.matchMedia();

    // ==========================================
    // DESKTOP & HIGH-PERFORMANCE TABLET (Premium)
    // ==========================================
    mm.add("(min-width: 768px) and (prefers-reduced-motion: no-preference)", () => {
      
      // Batch reveals for maximum performance instead of creating 100 ScrollTriggers
      ScrollTrigger.batch(".reveal", {
        start: "top 85%",
        once: true,
        onEnter: (elements) => {
          gsap.fromTo(elements, 
            { y: 40, opacity: 0 },
            { 
              y: 0, 
              opacity: 1, 
              duration: TIMING.reveal, 
              ease: EASING.premium, 
              stagger: 0.1,
              overwrite: "auto"
            }
          );
        }
      });

      // Section Titles - Smooth horizontal slide
      const titles = gsap.utils.toArray('.section-title');
      titles.forEach((title: any) => {
        gsap.fromTo(title,
          { x: -30, opacity: 0 },
          {
            x: 0, opacity: 1, duration: 1, ease: 'power3.out',
            scrollTrigger: { trigger: title, start: 'top 85%', once: true }
          }
        );
      });

      // Cinematic Text / Typography (Powered by SplitText)
      const cinematicTexts = gsap.utils.toArray('.cinematic-text, .hero-sub');
      cinematicTexts.forEach((el: any) => {
        const split = new SplitText(el, { type: 'words,chars' });
        
        gsap.from(split.chars, {
          opacity: 0,
          y: 20,
          rotationX: 90,
          transformOrigin: "0% 50% -50",
          ease: "power2.out",
          duration: 0.8,
          stagger: 0.02,
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      });

      // Technical/Digital ScrambleText for Pillar Numbers
      const whoNums = gsap.utils.toArray('.who-num');
      whoNums.forEach((el: any) => {
        const target = el.innerText;
        el.innerText = ""; // clear initially
        gsap.to(el, {
          duration: 1.2,
          scrambleText: { text: target, chars: "0123456789", speed: 0.5 },
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      });

      // Count-Up Animations (Desktop)
      const countups = gsap.utils.toArray('.countup');
      countups.forEach((el: any) => {
        const target = +(el.getAttribute('data-to') || 0);
        if (target) {
          gsap.to(el, {
            innerHTML: target,
            duration: 2,
            ease: "power3.out",
            snap: { innerHTML: 1 },
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          });
        }
      });

      // Stat Bar Expansion
      const statBars = gsap.utils.toArray('.stat-bar');
      statBars.forEach((el: any) => {
        gsap.to(el, {
          scaleX: 1,
          duration: 1.2,
          ease: "power3.inOut",
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      });

      // GSAP Hardware-Accelerated Infinite Marquee
      const tickerTrack = document.querySelector('.hero-ticker-track');
      if (tickerTrack) {
        gsap.to(tickerTrack, {
          xPercent: -33.333,
          ease: "none",
          duration: 30,
          repeat: -1
        });
      }

      // Footer Stagger Reveal
      gsap.from('.footer-top > div', {
        y: 40,
        opacity: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power3.out',
        scrollTrigger: { trigger: 'footer', start: 'top 85%', once: true }
      });

      // Membership Form Split Reveal
      gsap.from('.mem-left', {
        x: -40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#membership', start: 'top 80%', once: true }
      });
      gsap.from('.mem-form', {
        x: 40, opacity: 0, duration: 1, ease: 'power3.out',
        scrollTrigger: { trigger: '#membership', start: 'top 80%', once: true }
      });

      // Subtle Parallax (Transform only)
      gsap.to('.aurora-ribbon', {
        y: 150,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // Holographic 3D Tilt Observer removed for performance.
      // Replaced with high-performance pure CSS transforms in globals.css
    });

    // ==========================================
    // MOBILE / IOS OPTIMIZED (Rock solid FPS)
    // ==========================================
    mm.add("(max-width: 767px), (prefers-reduced-motion: reduce)", () => {
      // Mobile gets a very lightweight fade-up without stagger complexity
      const reveals = gsap.utils.toArray('.reveal, .cinematic-text, .section-title');
      reveals.forEach((el: any) => {
        gsap.fromTo(el, 
          { opacity: 0, y: 15 },
          { 
            opacity: 1, 
            y: 0, 
            duration: 0.8, 
            ease: 'power2.out',
            scrollTrigger: { trigger: el, start: "top 90%", once: true }
          }
        );
      });
      // Count-Up Animations Mobile
      const countups = gsap.utils.toArray('.countup');
      countups.forEach((el: any) => {
        const target = +(el.getAttribute('data-to') || 0);
        if (target) {
          gsap.to(el, {
            innerHTML: target,
            duration: 1.5,
            ease: "power2.out",
            snap: { innerHTML: 1 },
            scrollTrigger: { trigger: el, start: "top 90%", once: true }
          });
        }
      });
      // Stat Bar Expansion Mobile
      const statBars = gsap.utils.toArray('.stat-bar');
      statBars.forEach((el: any) => {
        gsap.to(el, {
          scaleX: 1,
          duration: 1,
          ease: "power2.inOut",
          scrollTrigger: { trigger: el, start: "top 90%", once: true }
        });
      });

      // GSAP Hardware-Accelerated Infinite Marquee Mobile
      const tickerTrack = document.querySelector('.hero-ticker-track');
      if (tickerTrack) {
        gsap.to(tickerTrack, {
          xPercent: -33.333,
          ease: "none",
          duration: 30, // Keep same speed
          repeat: -1
        });
      }
      // Disable 3D tilt and heavy parallax on mobile automatically
    });

    return () => mm.revert(); // Strict cleanup
  });

  return <div ref={container} style={{ display: 'none' }} />;
}
