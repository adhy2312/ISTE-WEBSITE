'use client'

import React, { useRef } from 'react';
import { gsap, ScrollTrigger, useGSAP } from './GSAPCore';
import { EASING, TIMING } from './MotionTokens';

interface TypographyEngineProps {
  text: string;
  type?: 'mask-up' | 'fade-stagger' | 'cinematic-blur' | 'editorial-lines';
  element?: React.ElementType;
  className?: string;
  delay?: number;
  scrollTrigger?: boolean;
}

/**
 * TypographyEngine
 * Production-grade text animation utility following Apple/Linear aesthetic principles.
 * Built for performance, zero layout-shift, and cinematic rhythm.
 */
export default function TypographyEngine({
  text,
  type = 'mask-up',
  element: Wrapper = 'h2',
  className = '',
  delay = 0,
  scrollTrigger = true,
}: TypographyEngineProps) {
  const containerRef = useRef<HTMLElement>(null);

  useGSAP(() => {
    if (!containerRef.current) return;

    // MatchMedia for Adaptive Performance (disables rich typography motion if reduced-motion is on)
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      const words = gsap.utils.toArray('.typo-word', containerRef.current);
      const triggerConfig = scrollTrigger ? {
        trigger: containerRef.current,
        start: 'top 85%',
        toggleActions: 'play none none none',
      } : undefined;

      if (type === 'mask-up') {
        gsap.fromTo(words,
          { y: '110%', rotate: 2 },
          {
            y: '0%',
            rotate: 0,
            duration: TIMING.reveal,
            ease: EASING.premium,
            stagger: 0.04,
            delay: delay,
            scrollTrigger: triggerConfig
          }
        );
      } else if (type === 'fade-stagger') {
        gsap.fromTo(words,
          { opacity: 0, y: 15 },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.base,
            ease: EASING.editorial,
            stagger: 0.03,
            delay: delay,
            scrollTrigger: triggerConfig
          }
        );
      } else if (type === 'cinematic-blur') {
        // High-end devices only
        gsap.fromTo(words,
          { opacity: 0, filter: 'blur(10px)', scale: 0.95 },
          {
            opacity: 1,
            filter: 'blur(0px)',
            scale: 1,
            duration: TIMING.cinematic,
            ease: EASING.cinematic,
            stagger: 0.05,
            delay: delay,
            scrollTrigger: triggerConfig
          }
        );
      } else if (type === 'editorial-lines') {
        // Assuming the parent wrapper handles line-breaks naturally, we animate the container
        gsap.fromTo(containerRef.current,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration: TIMING.reveal,
            ease: EASING.editorial,
            delay: delay,
            scrollTrigger: triggerConfig
          }
        );
      }
    });

    // Fallback for reduced motion
    mm.add("(prefers-reduced-motion: reduce)", () => {
      gsap.to(containerRef.current, {
        opacity: 1,
        duration: TIMING.base,
        delay: delay,
      });
    });

    return () => mm.revert();
  }, { scope: containerRef });

  // Simple React SplitText implementation
  const generateWords = () => {
    return text.split(' ').map((word, index) => (
      <span
        key={index}
        className="inline-block overflow-hidden relative"
        style={{ verticalAlign: 'top' }}
      >
        <span
          className={`typo-word inline-block ${type === 'mask-up' ? 'translate-y-[110%]' : 'opacity-0'} will-change-transform`}
        >
          {word}&nbsp;
        </span>
      </span>
    ));
  };

  return (
    <Wrapper ref={containerRef as any} className={`${className} typo-container opacity-100`}>
      {type === 'editorial-lines' ? (
        <span className="typo-word opacity-0 will-change-transform inline-block">
          {text}
        </span>
      ) : (
        generateWords()
      )}
    </Wrapper>
  );
}
