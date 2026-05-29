'use client';

import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from '../brain/engines/GSAPCore';
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

  // 2. Hero Typing Logic
  useEffect(() => {
    const typedSpan = document.getElementById('typed-out') as HTMLSpanElement | null;
    const tcursor = document.getElementById('tcursor') as HTMLSpanElement | null;
    const heroDivider = document.getElementById('hero-div') as HTMLDivElement | null;
    const heroSub = document.getElementById('hero-sub') as HTMLParagraphElement | null;

    let ti = 0;
    if (!typedSpan) return;
    typedSpan.textContent = '';

    const typeNext = () => {
      if (!typedSpan || !tcursor || !heroDivider || !heroSub) return;
      if (ti < heroTypedText.length) {
        typedSpan.textContent += heroTypedText[ti++];
        setTimeout(typeNext, 40); // Slightly faster, premium feel
      } else {
        tcursor.style.animation = 'none';
        tcursor.style.opacity = '1';
        setTimeout(() => {
          tcursor.classList.add('gone');
          heroDivider.classList.add('open');
        }, 600);
        setTimeout(() => heroSub.classList.add('show'), 900);
      }
    };
    const t = setTimeout(typeNext, 800);
    return () => clearTimeout(t);
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

      // Cinematic Text / Typography
      const cinematicTexts = gsap.utils.toArray('.cinematic-text');
      cinematicTexts.forEach((el: any) => {
        const text = el.innerText;
        el.innerHTML = '';
        text.split(' ').forEach((word: string) => {
          const wrapper = document.createElement('span');
          wrapper.style.display = 'inline-block';
          wrapper.style.overflow = 'hidden';
          
          const inner = document.createElement('span');
          inner.innerText = word + '\u00A0';
          inner.style.display = 'inline-block';
          inner.style.transform = 'translateY(110%)';
          inner.className = 'cinematic-word will-change-transform';
          
          wrapper.appendChild(inner);
          el.appendChild(wrapper);
        });

        gsap.to(el.querySelectorAll('.cinematic-word'), {
          y: '0%',
          duration: TIMING.reveal,
          ease: EASING.premium,
          stagger: 0.04,
          scrollTrigger: { trigger: el, start: "top 85%", once: true }
        });
      });

      // Count-Up Animations
      const countups = gsap.utils.toArray('.countup');
      countups.forEach((el: any) => {
        const target = +(el.getAttribute('data-to') || 0);
        if (target) {
          gsap.to(el, {
            innerHTML: target,
            duration: TIMING.cinematic,
            ease: EASING.cinematic,
            snap: { innerHTML: 1 },
            scrollTrigger: { trigger: el, start: "top 85%", once: true }
          });
        }
      });

      // Subtle Parallax (Transform only)
      gsap.to('.aurora-ribbon', {
        y: 150,
        opacity: 0.2,
        ease: 'none',
        scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true }
      });

      // Holographic 3D Tilt (No layout thrashing)
      const cards = gsap.utils.toArray('.execom-card, .team-card, .junior-card, .internship-card') as HTMLElement[];
      cards.forEach(card => {
        const handleMove = (e: MouseEvent) => {
          const rect = card.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const rotateX = ((y - centerY) / centerY) * -4;
          const rotateY = ((x - centerX) / centerX) * 4;

          gsap.to(card, {
            rotationX: rotateX,
            rotationY: rotateY,
            transformPerspective: 1000,
            ease: 'power2.out',
            duration: 0.4
          });
        };
        const handleLeave = () => {
          gsap.to(card, { rotationX: 0, rotationY: 0, duration: 0.7, ease: 'power3.out' });
        };
        card.addEventListener('mousemove', handleMove, { passive: true });
        card.addEventListener('mouseleave', handleLeave, { passive: true });
        return () => {
          card.removeEventListener('mousemove', handleMove);
          card.removeEventListener('mouseleave', handleLeave);
        };
      });
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
      // Disable 3D tilt and heavy parallax on mobile automatically
    });

    return () => mm.revert(); // Strict cleanup
  });

  return <div ref={container} style={{ display: 'none' }} />;
}
