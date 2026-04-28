import { draftMode } from 'next/headers'
import { getClient } from '@/lib/sanity/client'
import { internshipsQuery } from '@/app/queries/homeQueries'
import Image from 'next/image'
import Link from 'next/link'
import HomeAnimations from '@/app/components/HomeAnimations'

export const metadata = {
  title: "Internship Launchpad | ISTE MBCET",
  description: "Discover curated internship opportunities for ISTE MBCET members. Updated regularly by the chapter team.",
}

const FALLBACK_INTERNSHIPS = [
  {
    _id: 'i1',
    company: 'TechCorp India',
    role: 'Software Engineering Intern',
    type: 'Remote',
    domain: 'Software Engineering',
    stipend: '₹15,000/month',
    duration: '2 months',
    deadlineLabel: 'May 30, 2026',
    applyLink: '#',
    status: 'open',
    featured: true,
    logo: null,
  },
  {
    _id: 'i2',
    company: 'DesignHub Studios',
    role: 'UI/UX Design Intern',
    type: 'Hybrid',
    domain: 'UI/UX Design',
    stipend: '₹10,000/month',
    duration: '3 months',
    deadlineLabel: 'June 10, 2026',
    applyLink: '#',
    status: 'open',
    featured: false,
    logo: null,
  },
  {
    _id: 'i3',
    company: 'DataWave Analytics',
    role: 'Data Science Intern',
    type: 'Remote',
    domain: 'Data Science',
    stipend: '₹12,000/month',
    duration: '6 weeks',
    deadlineLabel: 'May 20, 2026',
    applyLink: '#',
    status: 'open',
    featured: false,
    logo: null,
  },
]

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  open: { label: 'Open', color: '#22c55e' },
  closed: { label: 'Closed', color: '#ef4444' },
  coming_soon: { label: 'Coming Soon', color: '#f59e0b' },
}

export default async function InternshipsPage() {
  const { isEnabled: preview } = await draftMode()
  let internships: any[] = []

  try {
    internships = await getClient(preview).fetch(internshipsQuery)
  } catch (err) {
    console.warn('Sanity fetch failed:', err)
  }

  if (!internships || internships.length === 0) {
    internships = FALLBACK_INTERNSHIPS
  }

  const open = internships.filter((i: any) => i.status === 'open')
  const other = internships.filter((i: any) => i.status !== 'open')

  return (
    <>
      <HomeAnimations heroTypedText="INTERNSHIP LAUNCHPAD" />

      <div className="c-dot" id="cdot"></div>
      <div className="c-ring" id="cring"></div>

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

      {/* Hero */}
      <section id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            ISTE MBCET &nbsp;·&nbsp; Member Resource
          </div>
          <h1 className="hero-headline">
            <span id="typed-out"></span>
            <span className="type-cursor" id="tcursor"></span>
          </h1>
          <div className="hero-divider" id="hero-div"></div>
          <p className="hero-sub" id="hero-sub">Curated opportunities, updated live by the chapter team</p>
        </div>
        <div className="hero-scroll">
          <div className="scroll-line"></div>
          Scroll
        </div>
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

          {open.length === 0 ? (
            <div className="reveal" style={{ padding: '60px 0', textAlign: 'center', color: 'var(--g400)', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2rem', marginBottom: '16px' }}>📭</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.4rem', color: 'var(--white)', marginBottom: '10px' }}>No open listings right now</div>
              <div style={{ fontSize: '.9rem' }}>Check back soon — the team updates this regularly.</div>
            </div>
          ) : (
            <div className="internship-grid">
              {open.map((intern: any, i: number) => (
                <div key={intern._id} className={`internship-card reveal ${['d1','d2','d3','d4'][i % 4]}`}>
                  <div className="intern-card-top">
                    <div className="intern-logo-wrap">
                      {intern.logo?.asset ? (
                        <img
                          src={intern.logo.asset.url}
                          alt={intern.company}
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      ) : (
                        <div className="intern-logo-placeholder">
                          {intern.company.charAt(0)}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="intern-company">{intern.company}</div>
                      {intern.domain && <div className="intern-domain">{intern.domain}</div>}
                    </div>
                  </div>

                  <h3 className="intern-role">{intern.role}</h3>

                  <div className="intern-tags">
                    {intern.type && <span className="intern-tag">{intern.type}</span>}
                    {intern.stipend && <span className="intern-tag">{intern.stipend}</span>}
                    {intern.duration && <span className="intern-tag">{intern.duration}</span>}
                  </div>

                  {intern.description && (
                    <p className="intern-desc">{intern.description}</p>
                  )}

                  <div className="intern-footer">
                    {intern.deadlineLabel && (
                      <div className="intern-deadline">
                        <span>⏱</span> Deadline: {intern.deadlineLabel}
                      </div>
                    )}
                    <a
                      href={intern.applyLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="intern-apply-btn"
                    >
                      Apply Now →
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Closed / Coming Soon */}
          {other.length > 0 && (
            <>
              <div className="execom-sub-label reveal" style={{ marginTop: '80px' }}>Past & Coming Soon</div>
              <div className="internship-grid">
                {other.map((intern: any, i: number) => {
                  const statusInfo = STATUS_LABELS[intern.status] || { label: intern.status, color: '#888' }
                  return (
                    <div key={intern._id} className={`internship-card internship-card--dim reveal ${['d1','d2','d3'][i % 3]}`}>
                      <div className="intern-card-top">
                        <div className="intern-logo-wrap">
                          <div className="intern-logo-placeholder">{intern.company.charAt(0)}</div>
                        </div>
                        <div>
                          <div className="intern-company">{intern.company}</div>
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
            <div className="footer-chip">Chapter Code: KE065</div>
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
              <li><a href="#">MBCET, Nalanchira</a></li>
              <li><a href="#">Thiruvananthapuram</a></li>
              <li><a href="#">Kerala — 695 015</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ISTE MBCET Student&apos;s Chapter &nbsp;·&nbsp; KE065. All rights reserved.</div>
          <div className="footer-socials">
            <a href="https://www.instagram.com/iste_mbcet/">Instagram</a>
            <a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  )
}
