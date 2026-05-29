'use client';

import { useEffect, useState, ReactNode } from 'react';

/**
 * Ensures heavy visual engines are completely stripped from the React tree
 * on iOS devices to prevent WebKit Jetsam (Out of Memory) crashes.
 * Resolves Next.js caching issues where server-side user-agent checks fail.
 */
export default function ClientPlatformBoundary({ children }: { children: ReactNode }) {
  const [shouldMount, setShouldMount] = useState(false);

  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    if (!isIOS) {
      // Stagger the mounting of heavy engines to prevent main-thread locking
      // and preserve Time-to-Interactive (TTI)
      const timer = setTimeout(() => {
        setShouldMount(true);
      }, 800);
      return () => clearTimeout(timer);
    }
  }, []);

  if (!shouldMount) return null;

  return <>{children}</>;
}
