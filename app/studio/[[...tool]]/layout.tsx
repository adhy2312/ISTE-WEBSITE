import type { Metadata, Viewport } from 'next'

export const metadata: Metadata = {
  title: 'ISTE MBCET — Sanity Studio',
  robots: 'noindex',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
}

export default function StudioLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // NOTE: No <html>/<body> here — those are in the root app/layout.tsx
  return <>{children}</>
}
