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

    // Track which domain the user is hovering over
    const handleDomainHover = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const domainEl = target.closest('.intern-domain')
      if (domainEl && domainEl.textContent) {
        notifyEngine('Internship', 'analyze_interest', { domain: domainEl.textContent })
        notifyEngine('Haptic', 'vibrate', { duration: 5 }) // subtle feedback on AI analysis
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
