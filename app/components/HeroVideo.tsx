'use client'

import { useRef, useEffect } from 'react'

const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4'

const FADE_DURATION = 0.5 // seconds

export default function HeroVideo() {
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    const video = videoRef.current
    if (!video) return

    video.style.opacity = '0'
    video.style.transition = `opacity ${FADE_DURATION}s ease`

    // timeupdate fires ~4x/sec natively — no rAF needed
    const handleTimeUpdate = () => {
      const { currentTime, duration } = video
      if (!duration || isNaN(duration)) return

      if (currentTime < FADE_DURATION) {
        video.style.opacity = String(Math.min(currentTime / FADE_DURATION, 1))
      } else if (currentTime >= duration - FADE_DURATION) {
        video.style.opacity = String(Math.max((duration - currentTime) / FADE_DURATION, 0))
      } else {
        video.style.opacity = '1'
      }
    }

    const handleEnded = () => {
      video.style.opacity = '0'
      setTimeout(() => {
        video.currentTime = 0
        video.play().catch(() => {})
      }, 100)
    }

    const handleCanPlay = () => video.play().catch(() => {})

    video.addEventListener('timeupdate', handleTimeUpdate)
    video.addEventListener('canplay', handleCanPlay)
    video.addEventListener('ended', handleEnded)

    if (video.readyState >= 3) video.play().catch(() => {})

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate)
      video.removeEventListener('canplay', handleCanPlay)
      video.removeEventListener('ended', handleEnded)
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
