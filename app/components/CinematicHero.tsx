'use client'

import { useEffect, useRef } from 'react'

export default function CinematicHero() {
    const videoRef = useRef<HTMLVideoElement>(null)

    useEffect(() => {
        const video = videoRef.current
        if (!video) return

        let raf: number

        const loop = () => {
            if (!video.duration) return

            const t = video.currentTime
            const d = video.duration

            if (t < 0.5) {
                video.style.opacity = `${t / 0.5}`
            } else if (t > d - 0.5) {
                video.style.opacity = `${(d - t) / 0.5}`
            } else {
                video.style.opacity = '1'
            }

            raf = requestAnimationFrame(loop)
        }

        const handleEnded = () => {
            video.style.opacity = '0'
            setTimeout(() => {
                video.currentTime = 0
                video.play()
            }, 100)
        }

        video.addEventListener('ended', handleEnded)
        raf = requestAnimationFrame(loop)

        return () => {
            cancelAnimationFrame(raf)
            video.removeEventListener('ended', handleEnded)
        }
    }, [])

    return (
        <div className="relative min-h-screen w-full overflow-hidden bg-white">

            <video
                ref={videoRef}
                src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260328_083109_283f3553-e28f-428b-a723-d639c617eb2b.mp4"
                autoPlay
                muted
                playsInline
                className="absolute left-0 right-0 w-full object-cover transition-opacity duration-500"
                style={{ top: '300px', inset: 'auto 0 0 0' }}
            />

            <div className="absolute inset-0 bg-gradient-to-b from-white via-transparent to-white" />

            <nav className="relative z-10 flex justify-between px-8 py-6 max-w-7xl mx-auto">
                <div className="text-3xl font-serif">Aethera®</div>

                <div className="hidden md:flex gap-8 text-sm">
                    <a className="text-black">Home</a>
                    <a className="text-gray-500">Studio</a>
                    <a className="text-gray-500">About</a>
                </div>

                <button className="bg-black text-white px-6 py-2 rounded-full">
                    Begin Journey
                </button>
            </nav>

            <section className="relative z-10 text-center pt-32">
                <h1 className="text-6xl font-serif">
                    Beyond <span className="text-gray-500 italic">silence,</span><br />
                    <span className="text-gray-500 italic">the eternal.</span>
                </h1>
            </section>
        </div>
    )
}