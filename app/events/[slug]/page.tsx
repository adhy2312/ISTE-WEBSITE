import { getClient } from '@/lib/sanity/client'
import { eventBySlugQuery, homePageQuery } from '@/app/queries/homeQueries'
import { notFound } from 'next/navigation'
import { urlForImage } from '@/lib/sanity/image'
import Link from 'next/link'
import Image from 'next/image'
import { PortableText } from '@portabletext/react'
import HomeAnimations from '@/app/components/HomeAnimations'

// Revalidate this page every 60 seconds
export const revalidate = 60

export default async function EventPage({ params }: { params: { slug: string } }) {
  const { slug } = await params
  const event = await getClient().fetch(eventBySlugQuery, { slug })
  
  if (!event) {
    notFound()
  }

  // Fetch settings for Navbar/Footer
  const sanityData = await getClient().fetch(homePageQuery)
  const settings = sanityData?.settings || {}
  const navCta = settings.navCtaLabel || "Join Now"
  const footerTagline = settings.footerTagline || "Indian Society for Technical Education — Mar Baselios College of Engineering and Technology Student Chapter, Kerala."

  return (
    <>
      <HomeAnimations heroTypedText="ISTE MBCET EVENTS" />

      <div className="c-dot" id="cdot"></div>
      <div className="c-ring" id="cring"></div>

      {/* Grid Background */}
      <div className="grid-lines" style={{ position: 'fixed', zIndex: -1 }}>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
      </div>

      <nav id="navbar">
        <Link href="/" className="nav-logo">
          ISTE SC <span>MBCET</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/#events">Events</Link></li>
          <li><Link href="/internships" className="nav-link-highlight">Launchpad ✦</Link></li>
        </ul>
        <Link href="/#membership" className="nav-cta">{navCta}</Link>
        <div className="nav-hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mob-menu" id="mob-menu">
        <div className="mob-menu-inner">
          <button className="mob-close" id="mob-close" aria-label="Close menu">✕</button>
          <nav className="mob-nav">
            <Link href="/#about" className="mob-link">About</Link>
            <Link href="/#events" className="mob-link">Events</Link>
            <Link href="/internships" className="mob-link mob-link--accent">Internship Launchpad ✦</Link>
          </nav>
          <Link href="/#membership" className="mob-cta">{navCta} →</Link>
        </div>
      </div>

      <main style={{ minHeight: '100vh', paddingTop: '60px' }}>
        <div className="event-hero">
          <Link href="/#events" style={{ display: 'inline-block', marginBottom: '32px', color: 'var(--g400)', textDecoration: 'none', fontFamily: 'var(--font-mono)', letterSpacing: '0.1em', fontSize: '0.85rem' }}>← BACK TO EVENTS</Link>
          <h1 className="event-hero-title reveal">{event.title}</h1>
          <div className="event-meta reveal d1">
            <span>{event.dateLabel}</span>
            {event.eventType && (
              <>
                <span style={{ color: 'var(--g600)' }}>•</span>
                <span>{event.eventType}</span>
              </>
            )}
            <span style={{ color: 'var(--g600)' }}>•</span>
            <span style={{ color: event.status === 'upcoming' ? '#4f6ef7' : 'var(--g400)' }}>{event.status === 'upcoming' ? 'UPCOMING' : 'PAST EVENT'}</span>
          </div>
        </div>

        {event.description && (
          <div className="event-body-content reveal d2">
            <PortableText value={event.description} />
          </div>
        )}

        {event.gallery && event.gallery.length > 0 && (
          <div className="interactive-gallery reveal d3">
            {event.gallery.map((img: any, i: number) => (
              <div key={i} className="gallery-item">
                <img 
                  src={urlForImage(img).width(800).height(800).url()} 
                  alt={`${event.title} gallery image ${i + 1}`} 
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        )}
      </main>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo"><Image src="/iste.png" alt="ISTE SC MBCET" width={80} height={80} className="footer-logo-img" /></div>
            <div className="footer-tagline">{footerTagline}</div>
            <div className="footer-chip">Chapter Code: {settings.chapterCode || 'KE065'}</div>
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#events">Events</Link></li>
              <li><Link href="/internships">Internship Launchpad</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ISTE MBCET Student's Chapter</div>
        </div>
      </footer>
    </>
  )
}
