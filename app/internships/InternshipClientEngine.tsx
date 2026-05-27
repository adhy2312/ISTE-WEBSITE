'use client'

import { useEffect } from 'react'
import { useBrain } from '@/app/brain/BrainProvider'

export default function InternshipClientEngine() {
  const { notifyEngine } = useBrain()

  useEffect(() => {
    // Notify brain that user entered the internship launchpad
    notifyEngine('Internship', 'page_viewed')
    notifyEngine('Neural', 'processing') // trigger neural hum
    
    const timeout = setTimeout(() => {
      notifyEngine('Neural', 'idle')
    }, 1500)

    // Track which domain the user is hovering over with extreme performance throttling
    let lastHoveredDomain = '';
    let throttleTimer: NodeJS.Timeout | null = null;
    
    const handleDomainHover = (e: MouseEvent) => {
      if (throttleTimer) return;
      
      throttleTimer = setTimeout(() => {
        throttleTimer = null;
      }, 100); // 100ms throttle

      const target = e.target as HTMLElement;
      const domainEl = target.closest('.intern-domain');
      const text = domainEl?.textContent;
      
      if (domainEl && text && text !== lastHoveredDomain) {
        lastHoveredDomain = text;
        notifyEngine('Internship', 'analyze_interest', { domain: text });
        notifyEngine('Haptic', 'vibrate', { duration: 5 }); // subtle feedback on AI analysis
      }
    }

    document.addEventListener('mouseover', handleDomainHover, { passive: true })

    return () => {
      clearTimeout(timeout)
      document.removeEventListener('mouseover', handleDomainHover)
      notifyEngine('Neural', 'idle')
    }
  }, [notifyEngine])

  return null
}
