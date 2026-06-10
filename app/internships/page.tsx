
import { draftMode } from 'next/headers'
import { getClient } from '@/lib/sanity/client'
import { internshipsQuery } from '@/app/queries/homeQueries'
import Image from 'next/image'
import Link from 'next/link'
import HomeAnimations from '@/app/components/HomeAnimations'
import InternshipClientEngine from './InternshipClientEngine'
import InternshipGrid from './InternshipGrid'
import ResumeAnalyzer from './ResumeAnalyzer'
import AliveClock from '@/app/components/AliveClock'
import GLSLBackground from '@/app/components/GLSLBackground'
export interface InternshipData {
  _id?: string;
  company?: string;
  domain?: string;
  role?: string;
  type?: string;
  stipend?: string;
  duration?: string;
  description?: string;
  applyLink?: string;
  deadlineLabel?: string;
  status?: string;
  logo?: { asset?: { url?: string } };
  matchScore?: number;
  [key: string]: unknown;
}

import { Metadata } from 'next'

// Webhook handles on-demand revalidation, but we also revalidate periodically
export const revalidate = 60;

export const metadata: Metadata = {
  title: "Internship Launchpad | Member Resources",
  description: "Exclusive internship opportunities curated by ISTE MBCET for our student members. Connect with industry leaders and kickstart your career.",
  openGraph: {
    title: "Internship Launchpad | ISTE MBCET",
    description: "Exclusive internship opportunities curated for ISTE MBCET members.",
    images: ['/iste.png'],
  }
}

// No fallback data — only real CMS listings are shown
const FALLBACK_INTERNSHIPS: InternshipData[] = []

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#22c55e' },
  closed: { label: 'Closed', color: '#ef4444' },
  coming_soon: { label: 'Coming Soon', color: '#f59e0b' },
}

export default async function InternshipsPage() {
  const { isEnabled: preview } = await draftMode()
  let internships: InternshipData[] = []

  try {
    internships = await getClient(preview).fetch(internshipsQuery)
  } catch (err) {
    console.warn('Sanity fetch failed:', err)
  }

  if (!internships || internships.length === 0) {
    internships = FALLBACK_INTERNSHIPS
  }

  // Pre-validated by GROQ query, but enforce strict link validity to avoid dead buttons
  const validInternships = internships.filter((i: InternshipData) => {
    return i.applyLink && i.applyLink !== '#' && i.applyLink.startsWith('http');
  });
  const open = validInternships.filter((i: InternshipData) => i.status === 'open');
  const other = validInternships.filter((i: InternshipData) => i.status !== 'open');

  return (
    <>
      <GLSLBackground />
      <HomeAnimations heroTypedText="INTERNSHIP LAUNCHPAD" />



    {/* Navbar */}
      <nav id="navbar">
        <Link href="/" className="nav-logo">
          <Image src="/iste.png" alt="ISTE SC MBCET" width={40} height={40} className="logo-img" />
          <span>ISTE SC MBCET</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/#who">Who We Are</Link></li>
          <li><Link href="/#execom">ExeCom</Link></li>
          <li><Link href="/#events">Events</Link></li>
          <li><Link href="/internships" style={{ color: 'var(--white)' }}>Launchpad</Link></li>
        </ul>
        <Link href="/#membership" className="nav-cta">Join Now</Link>
        <div className="nav-hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <div className="mob-menu" id="mob-menu" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        <div className="mob-menu-inner">
          <button className="mob-close" id="mob-close" aria-label="Close menu">✕</button>
          <nav className="mob-nav" aria-label="Mobile Navigation">
            <Link href="/#about" className="mob-link">About</Link>
            <Link href="/#who" className="mob-link">Who We Are</Link>
            <Link href="/#benefits" className="mob-link">Benefits</Link>
            <Link href="/#execom" className="mob-link">ExeCom</Link>
            <Link href="/#events" className="mob-link">Events</Link>
            <Link href="/internships" className="mob-link mob-link--accent">Internship Launchpad ✦</Link>
          </nav>
          <Link href="/#membership" className="mob-cta">Join Now →</Link>
          <div className="mob-footer">
            <a href="https://www.instagram.com/iste_mbcet/">Instagram</a>
            <a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a>
          </div>
        </div>
      </div>

      {/* Hero */}
      <section id="hero">
        <div className="hero-content">
          <div className="hero-badge reveal">
            ISTE MBCET &nbsp;·&nbsp; Member Resource
          </div>
          <h1 className="hero-headline">
            <span id="typed-out"></span>
            <span className="type-cursor" id="tcursor"></span>
          </h1>
          <div className="hero-divider" id="hero-div"></div>
          <p className="hero-sub" id="hero-sub">Curated opportunities, updated live by the chapter team</p>
        </div>

      <InternshipClientEngine />
      </section>

      {/* Main Content */}
      <section style={{ background: 'var(--g900)', borderTop: '1px solid var(--border)' }}>
        <div className="section-inner">
          <div className="section-tag reveal">Opportunities</div>
          <h2 className="section-title reveal d1">
            Open <em>Internships</em>
          </h2>
          <p className="section-body reveal d2" style={{ marginTop: '20px', marginBottom: '60px' }}>
            These positions have been curated and verified by the ISTE MBCET chapter team. Apply directly via the link provided.
          </p>

          {/* SEO Structured Data for Crawlers (JobPosting schema) */}
          {open.length > 0 && (
            <script
              type="application/ld+json"
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(
                  open.map((intern: InternshipData) => ({
                    "@context": "https://schema.org",
                    "@type": "JobPosting",
                    "title": intern.role || "Internship",
                    "description": intern.description || `Internship role at ${intern.company}`,
                    "hiringOrganization": {
                      "@type": "Organization",
                      "name": intern.company || "Unknown Company",
                      "logo": intern.logo?.asset?.url || ""
                    },
                    "jobLocation": {
                      "@type": "Place",
                      "address": {
                        "@type": "PostalAddress",
                        "addressCountry": "IN",
                        "addressRegion": "Kerala"
                      }
                    },
                    "employmentType": "INTERN",
                    "validThrough": intern.deadline || "",
                    "datePosted": intern._createdAt || new Date().toISOString()
                  }))
                )
              }}
            />
          )}

          {/* Dynamic Statically Cached Grid with Search and Skeletons */}
          {open.length === 0 ? (
            <div className="reveal" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--g400)', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--white)', marginBottom: '10px' }}>No open listings right now</div>
              <div style={{ fontSize: '.9rem' }}>Check back soon — the team updates this regularly.</div>
            </div>
          ) : (
            <InternshipGrid internships={open} />
          )}

          {/* Closed / Coming Soon */}
          {other.length > 0 && (
            <>
              <div className="execom-sub-label reveal" style={{ marginTop: '80px' }}>Past & Coming Soon</div>
              <div className="internship-grid">
                {other.map((intern: InternshipData, i: number) => {
                  const statusKey = typeof intern.status === 'string' ? intern.status : 'closed';
                  const statusInfo = Object.prototype.hasOwnProperty.call(STATUS_LABELS, statusKey) ? STATUS_LABELS[statusKey] : { label: statusKey, color: '#888' };
                  return (
                    <div key={intern._id} className={`internship-card internship-card--dim reveal ${['d1', 'd2', 'd3'][i % 3]}`}>
                      <div className="intern-card-top">
                        <div className="intern-logo-wrap">
                          <div className="intern-logo-placeholder">{(intern.company || '?').charAt(0)}</div>
                        </div>
                        <div>
                          <div className="intern-company">{intern.company || 'Unknown Company'}</div>
                          {intern.domain && <div className="intern-domain">{intern.domain}</div>}
                        </div>
                        <span className="intern-status-badge" style={{ background: statusInfo.color + '22', color: statusInfo.color, borderColor: statusInfo.color + '55' }}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <h3 className="intern-role">{intern.role}</h3>
                      <div className="intern-tags">
                        {intern.type && <span className="intern-tag">{intern.type}</span>}
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          {/* AI Resume Analyzer Section */}
          <ResumeAnalyzer liveInternships={open} />
        </div>
      </section>

      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo">
              <Image src="/iste.png" alt="ISTE SC MBCET" width={80} height={80} className="footer-logo-img" />
            </div>
            <div className="footer-tagline">
              Indian Society for Technical Education — Mar Baselios College of Engineering and Technology Student Chapter, Kerala.
            </div>
            {/* Removed chapter code display */}
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#who">Who We Are</Link></li>
              <li><Link href="/#execom">ExeCom</Link></li>
              <li><Link href="/#events">Events</Link></li>
              <li><Link href="/internships">Internship Launchpad</Link></li>
              <li><Link href="/#membership">Join Now</Link></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Follow Us</div>
            <ul className="footer-links">
              <li><a href="https://www.instagram.com/iste_mbcet/">Instagram</a></li>
              <li><a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <ul className="footer-links">
              <li><a href="mailto:istestudentchapter@mbcet.ac.in">istestudentchapter@mbcet.ac.in</a></li>
              <li><a href="https://maps.google.com/?q=Mar+Baselios+College+of+Engineering+and+Technology" target="_blank" rel="noopener noreferrer">MBCET, Nalanchira</a></li>
              <li><a href="https://maps.google.com/?q=Thiruvananthapuram,Kerala" target="_blank" rel="noopener noreferrer">Thiruvananthapuram</a></li>
              <li><a href="https://maps.google.com/?q=Kerala+695015" target="_blank" rel="noopener noreferrer">Kerala — 695 015</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ISTE MBCET Student&apos;s Chapter. All rights reserved.</div>
          <div className="footer-socials">
            <a href="https://www.instagram.com/iste_mbcet/">Instagram</a>
            <a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a>
          </div>
        </div>
        <AliveClock />
      </footer>
    </>
  )
}
