import { getClient } from '@/lib/sanity/client'
import { urlForImage } from '@/lib/sanity/image'
import Image from 'next/image'
import Link from 'next/link'
import HomeAnimations from '@/app/components/HomeAnimations'
import AliveClock from '@/app/components/AliveClock'
import { ExternalLink, Star } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Member Showcase | ISTE MBCET',
  description: 'Explore projects built by ISTE MBCET student members — real-world engineering, open-source contributions, and innovative ideas from Kerala\'s top engineers.',
  openGraph: {
    title: 'Member Showcase | ISTE MBCET',
    description: 'Real-world projects built by ISTE MBCET student engineers.',
    images: ['/iste.png'],
  },
}

export const revalidate = 60

interface MemberProject {
  _id: string
  memberName: string
  memberRole?: string
  memberPhoto?: { asset: { url: string } }
  repoName: string
  description?: string
  githubUrl: string
  liveUrl?: string
  coverImage?: { asset: { url: string; metadata: { lqip: string } } }
  techTags?: string[]
  stars?: number
  featured?: boolean
}

const TECH_COLORS: Record<string, string> = {
  'React': '#61dafb',
  'Next.js': '#ffffff',
  'TypeScript': '#3178c6',
  'Python': '#3776ab',
  'Rust': '#ce422b',
  'Go': '#00add8',
  'Node.js': '#339933',
  'PostgreSQL': '#336791',
  'Docker': '#2496ed',
  'TensorFlow': '#ff6f00',
  'PyTorch': '#ee4c2c',
  'Supabase': '#3ecf8e',
  'Tailwind': '#06b6d4',
  'Java': '#f89820',
  'C++': '#00599c',
  'Swift': '#f05138',
  'Kotlin': '#7f52ff',
}

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
    </svg>
  );
}

function TagPill({ tag }: { tag: string }) {
  const color = TECH_COLORS[tag] || '#64748b'
  return (
    <span
      className="tech-tag"
      style={{
        background: `${color}15`,
        color,
        borderColor: `${color}35`,
      }}
    >
      {tag}
    </span>
  )
}

export default async function ShowcasePage() {
  let projects: MemberProject[] = []

  try {
    projects = await getClient().fetch(
      `*[_type == "memberProject"] | order(featured desc, stars desc, order asc) {
        _id, memberName, memberRole, memberPhoto { asset->{ url } },
        repoName, description, githubUrl, liveUrl,
        coverImage { asset->{ url, metadata { lqip } } },
        techTags, stars, featured
      }`,
      {},
      { next: { revalidate: 60 } }
    )
  } catch {
    // Sanity unreachable
  }

  const featured = projects.filter(p => p.featured)
  const regular = projects.filter(p => !p.featured)

  return (
    <>
      <HomeAnimations heroTypedText="MEMBER SHOWCASE" />

      {/* Grid Lines Background */}
      <div className="grid-lines" style={{ position: 'fixed', zIndex: -1 }}>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
      </div>

      {/* Navbar */}
      <nav id="navbar">
        <Link href="/" className="nav-logo">
          <Image src="/iste.png" alt="ISTE SC MBCET" width={40} height={40} className="logo-img" />
          <span>ISTE SC MBCET</span>
        </Link>
        <ul className="nav-links">
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/#events">Events</Link></li>
          <li><Link href="/internships">Launchpad</Link></li>
          <li><Link href="/showcase" style={{ color: 'var(--white)' }}>Showcase</Link></li>
        </ul>
        <Link href="/#membership" className="nav-cta">Join Now</Link>
        <div className="nav-hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className="mob-menu" id="mob-menu" role="dialog" aria-modal="true" aria-label="Mobile Navigation Menu">
        <div className="mob-menu-inner">
          <button className="mob-close" id="mob-close" aria-label="Close menu">✕</button>
          <nav className="mob-nav" aria-label="Mobile Navigation">
            <Link href="/#about" className="mob-link">About</Link>
            <Link href="/#events" className="mob-link">Events</Link>
            <Link href="/internships" className="mob-link">Launchpad</Link>
            <Link href="/showcase" className="mob-link mob-link--accent">Showcase ✦</Link>
          </nav>
          <Link href="/#membership" className="mob-cta">Join Now →</Link>
        </div>
      </div>

      {/* Hero */}
      <section id="hero">
        <div className="hero-content">
          <div className="hero-badge reveal">ISTE MBCET &nbsp;·&nbsp; Member Projects</div>
          <h1 className="hero-headline">
            <span id="typed-out"></span>
            <span className="type-cursor" id="tcursor"></span>
          </h1>
          <div className="hero-divider" id="hero-div"></div>
          <p className="hero-sub" id="hero-sub">
            Real engineering. Open source. Built by MBCET students.
          </p>
        </div>
      </section>

      {/* Main Content */}
      <main style={{ background: 'var(--g900)', borderTop: '1px solid var(--border)', paddingBottom: '80px' }}>
        <div className="section-inner">
          <div className="section-tag reveal">Our Work</div>
          <h2 className="section-title reveal d1">
            Projects <em>Built</em> by Members
          </h2>
          <p className="section-body reveal d2" style={{ marginTop: '20px', marginBottom: '60px' }}>
            From AI pipelines to mobile apps — a curated gallery of what ISTE MBCET engineers build when they go beyond the syllabus.
          </p>

          {projects.length === 0 ? (
            <div className="reveal" style={{ padding: '80px 0', textAlign: 'center', color: 'var(--g400)', borderTop: '1px solid var(--border)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🛠</div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: '1.6rem', color: 'var(--white)', marginBottom: '12px' }}>Gallery loading soon</div>
              <div style={{ fontSize: '.95rem' }}>Add projects via Sanity Studio → Member Project Showcase</div>
            </div>
          ) : (
            <>
              {/* Featured Projects Bento Grid */}
              {featured.length > 0 && (
                <div style={{ marginBottom: '80px' }}>
                  <div className="showcase-sublabel reveal">Featured</div>
                  <div className="showcase-bento">
                    {featured.map((p, i) => (
                      <ProjectCard key={p._id} project={p} featured={true} delay={['d1','d2','d3'][i % 3]} />
                    ))}
                  </div>
                </div>
              )}

              {/* Regular Grid */}
              {regular.length > 0 && (
                <div>
                  {featured.length > 0 && <div className="showcase-sublabel reveal">All Projects</div>}
                  <div className="showcase-grid">
                    {regular.map((p, i) => (
                      <ProjectCard key={p._id} project={p} featured={false} delay={['d1','d2','d3'][i % 3]} />
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

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
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><Link href="/#about">About</Link></li>
              <li><Link href="/#events">Events</Link></li>
              <li><Link href="/internships">Internship Launchpad</Link></li>
              <li><Link href="/showcase">Member Showcase</Link></li>
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
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ISTE MBCET Student&apos;s Chapter. All rights reserved.</div>
        </div>
        <AliveClock />
      </footer>

      <style>{`
        .showcase-sublabel {
          font-family: var(--font-mono);
          font-size: 0.7rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: var(--g400);
          margin-bottom: 24px;
        }

        /* Bento for featured */
        .showcase-bento {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
          gap: 20px;
        }
        .showcase-bento .showcase-card--featured {
          grid-column: span 1;
        }
        @media (min-width: 900px) {
          .showcase-bento .showcase-card--featured:first-child {
            grid-column: span 2;
          }
        }

        /* Regular grid */
        .showcase-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 20px;
        }

        /* Card */
        .showcase-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 20px;
          overflow: hidden;
          transition: transform 0.3s ease, box-shadow 0.3s ease, border-color 0.3s ease;
          display: flex;
          flex-direction: column;
          position: relative;
        }
        .showcase-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 48px rgba(0,0,0,0.4);
          border-color: rgba(255,255,255,0.12);
        }
        .card-cover {
          width: 100%;
          aspect-ratio: 16/9;
          position: relative;
          background: rgba(15,23,42,0.8);
          overflow: hidden;
        }
        .card-cover-placeholder {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 3rem;
          background: linear-gradient(135deg, rgba(59,130,246,0.1), rgba(139,92,246,0.1));
        }
        .card-body {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          flex: 1;
        }
        .card-meta {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        .member-avatar {
          width: 32px; height: 32px; border-radius: 50%;
          background: rgba(255,255,255,0.08);
          overflow: hidden;
          position: relative;
          flex-shrink: 0;
          display: flex; align-items: center; justify-content: center;
          font-size: 0.8rem; font-weight: 600; color: var(--g300);
        }
        .member-info { flex: 1; }
        .member-name {
          font-size: 0.8rem; font-weight: 600; color: var(--white);
        }
        .member-role {
          font-size: 0.7rem; color: var(--g400);
        }
        .star-badge {
          display: flex; align-items: center; gap: 4px;
          font-family: var(--font-mono); font-size: 0.72rem; color: #f59e0b;
        }
        .card-title {
          font-size: 1.15rem; font-weight: 700;
          color: var(--white); letter-spacing: -0.01em;
          margin: 0;
        }
        .card-desc {
          font-size: 0.85rem; color: var(--g300);
          line-height: 1.6; margin: 0;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .card-tags {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .tech-tag {
          font-family: var(--font-mono);
          font-size: 0.65rem;
          padding: 3px 9px;
          border-radius: 6px;
          border: 1px solid;
          letter-spacing: 0.02em;
          white-space: nowrap;
        }
        .card-actions {
          display: flex; gap: 10px; margin-top: auto; padding-top: 8px;
        }
        .card-btn {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 9px 16px; border-radius: 10px; border: none;
          font-size: 0.82rem; font-weight: 600; cursor: pointer;
          text-decoration: none; transition: all 0.2s;
        }
        .card-btn--primary {
          background: rgba(255,255,255,0.06);
          border: 1px solid rgba(255,255,255,0.1);
          color: var(--white);
        }
        .card-btn--primary:hover {
          background: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .card-btn--demo {
          background: rgba(59,130,246,0.1);
          border: 1px solid rgba(59,130,246,0.25);
          color: #60a5fa;
        }
        .card-btn--demo:hover {
          background: rgba(59,130,246,0.18);
          transform: translateY(-1px);
        }
        .featured-badge {
          position: absolute; top: 14px; right: 14px;
          background: rgba(245,158,11,0.15);
          border: 1px solid rgba(245,158,11,0.35);
          color: #f59e0b;
          font-family: var(--font-mono); font-size: 0.6rem;
          letter-spacing: 0.12em; text-transform: uppercase;
          padding: 3px 8px; border-radius: 6px; z-index: 2;
        }

        @media (max-width: 640px) {
          .showcase-bento, .showcase-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </>
  )
}

function ProjectCard({ project, featured, delay }: { project: MemberProject; featured: boolean; delay: string }) {
  const initials = project.memberName.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div className={`showcase-card ${featured ? 'showcase-card--featured' : ''} reveal ${delay}`}>
      {featured && <div className="featured-badge">★ Featured</div>}

      {/* Cover Image */}
      <div className="card-cover">
        {project.coverImage?.asset?.url ? (
          <Image
            src={project.coverImage.asset.url}
            alt={project.repoName}
            fill
            className="object-cover"
            placeholder={project.coverImage.asset.metadata?.lqip ? 'blur' : 'empty'}
            blurDataURL={project.coverImage.asset.metadata?.lqip}
          />
        ) : (
          <div className="card-cover-placeholder">
            <span style={{ opacity: 0.4 }}>{'</>'}</span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="card-body">
        {/* Member Meta */}
        <div className="card-meta">
          <div className="member-avatar">
            {project.memberPhoto?.asset?.url ? (
              <Image src={project.memberPhoto.asset.url} alt={project.memberName} fill className="object-cover" />
            ) : initials}
          </div>
          <div className="member-info">
            <div className="member-name">{project.memberName}</div>
            {project.memberRole && <div className="member-role">{project.memberRole}</div>}
          </div>
          {project.stars !== undefined && project.stars > 0 && (
            <div className="star-badge">
              <Star size={12} fill="#f59e0b" />
              {project.stars}
            </div>
          )}
        </div>

        <h3 className="card-title">{project.repoName}</h3>

        {project.description && (
          <p className="card-desc">{project.description}</p>
        )}

        {project.techTags && project.techTags.length > 0 && (
          <div className="card-tags">
            {project.techTags.slice(0, 5).map(tag => (
              <TagPill key={tag} tag={tag} />
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="card-actions">
          <a
            href={project.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-btn card-btn--primary"
          >
            <GitHubIcon size={14} />
            View Code
          </a>
          {project.liveUrl && (
            <a
              href={project.liveUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="card-btn card-btn--demo"
            >
              <ExternalLink size={14} />
              Live Demo
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
