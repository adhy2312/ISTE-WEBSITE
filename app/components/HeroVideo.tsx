'use client'

import { useRef, useEffect } from 'react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

const FADE_DURATION = 0.5 // seconds

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const rafRef = useRef<number | null>(null)
  const isFadingOut = useRef(false)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.style.opacity = '0'

    const tick = () => {
      if (!video) return

      const { currentTime, duration } = video
      if (!duration || isNaN(duration)) {
        rafRef.current = requestAnimationFrame(tick)
        return
      }

      if (currentTime < FADE_DURATION) {
        const progress = currentTime / FADE_DURATION
        video.style.opacity = String(Math.min(progress, 1))
        isFadingOut.current = false
      }

      const fadeOutStart = duration - FADE_DURATION
      if (currentTime >= fadeOutStart && !isFadingOut.current) {
        isFadingOut.current = true
      }
      if (isFadingOut.current && currentTime >= fadeOutStart) {
        const progress = 1 - (currentTime - fadeOutStart) / FADE_DURATION
        video.style.opacity = String(Math.max(progress, 0))
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      isFadingOut.current = false
      setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    const handleCanPlay = () => {
      video.play().catch(() => {})
      rafRef.current = requestAnimationFrame(tick)
    }

    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleEnded)

    if (video.readyState >= 3) {
      video.play().catch(() => {})
      rafRef.current = requestAnimationFrame(tick)
    }

    return () => {
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current)
      }
    }
  }, [])

  return (
    <div
      className="absolute w-full overflow-hidden pointer-events-none"
      style={{ top: '300px', inset: 'auto 0 0 0' } as React.CSSProperties}
      aria-hidden="true"
    >
      <video
        ref={videoRef}
        src={VIDEO_URL}
        muted
        playsInline
        preload="auto"
        className="w-full h-full object-cover block opacity-0 transition-none"
      />
      <div
        className="absolute inset-0 pointer-events-none bg-gradient-to-b from-white via-transparent to-white"
      />
    </div>
  )
}
