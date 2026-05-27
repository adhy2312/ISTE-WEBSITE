'use client';

import { useEffect, useState } from 'react';

/**
 * ENGINE 47: INERTIAL ROUTING (Page Transitions)
 * Instead of hard loading cuts, this Engine uses CSS springs to transition
 * between pages. The outgoing page scales down/blurs, and the new page sweeps in.
 * We remove the animation class after 1s so `position: fixed` elements (like the Navbar) 
 * break free from the CSS transform stacking context.
 */
export default function Template({ children }: { children: React.ReactNode }) {
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    // Free the DOM from the transform context after the 1s animation
    const t = setTimeout(() => setAnimating(false), 1000);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className={animating ? "page-sweep-in" : ""}>
      {children}
    </div>
  );
}
