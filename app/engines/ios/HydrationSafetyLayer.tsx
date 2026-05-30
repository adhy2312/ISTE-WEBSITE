'use client';

import { useEffect, useState, ReactNode } from 'react';

interface HydrationSafetyLayerProps {
  children: ReactNode;
}

export const HydrationSafetyLayer = ({ children }: HydrationSafetyLayerProps) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  if (!isMounted) {
    // During SSR, return children without any client-side specific rendering
    // Alternatively, we could return null if the entire engine is client-only.
    // Returning children ensures SSR content is identical to initial client render
    return <>{children}</>;
  }

  return <>{children}</>;
};

export const useHydrationSafeState = <T,>(initialState: T): [T, (state: T) => void, boolean] => {
  const [state, setState] = useState<T>(initialState);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsMounted(true), 0);
    return () => clearTimeout(t);
  }, []);

  return [state, setState, isMounted];
};
