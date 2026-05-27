'use client';

import { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useBrain } from './BrainProvider';

/**
 * ENGINE 45: PREFETCH ENGINE (PREDICTIVE ROUTING)
 * Tracks the user's cursor velocity vector.
 * If the math predicts they are moving their mouse towards a specific internal link,
 * it fetches the page data *before* they even click, resulting in a 0ms load time.
 */
export default function PrefetchEngine() {
  const router = useRouter();
  const brain = useBrain();
  const lastPos = useRef({ x: 0, y: 0, time: 0 });
  const prefetchedUrls = useRef<Set<string>>(new Set());

  useEffect(() => {
    brain.registerEngine('Prefetch');

    const handleMouseMove = (e: MouseEvent) => {
      const now = performance.now();
      const dt = now - lastPos.current.time;

      if (dt > 50) { // Calculate vector every 50ms
        const dx = e.clientX - lastPos.current.x;
        const dy = e.clientY - lastPos.current.y;
        
        // Only run prediction if moving reasonably fast
        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
          const links = document.querySelectorAll('a[href^="/"]');
          
          links.forEach((link) => {
            const href = link.getAttribute('href');
            if (!href || href.startsWith('/#') || prefetchedUrls.current.has(href)) return;

            const rect = link.getBoundingClientRect();
            
            // Basic vector collision prediction
            // Check if cursor is moving towards the button
            const linkCenterX = rect.left + rect.width / 2;
            const linkCenterY = rect.top + rect.height / 2;
            
            const distanceX = linkCenterX - e.clientX;
            const distanceY = linkCenterY - e.clientY;
            const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

            // If within 200px and moving towards it
            if (distance < 250) {
              // Check dot product to see if moving towards
              const dotProduct = (dx * distanceX + dy * distanceY);
              if (dotProduct > 0) {
                // Moving towards the link! Prefetch!
                prefetchedUrls.current.add(href);
                router.prefetch(href);
                brain.notifyEngine('Prefetch', 'predictive_fetch', { href });
              }
            }
          });
        }

        lastPos.current = { x: e.clientX, y: e.clientY, time: now };
      }
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [router]);

  return null;
}
