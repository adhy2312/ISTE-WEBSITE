import { draftMode } from 'next/headers'
import { getClient } from '@/lib/sanity/client'
import Image from 'next/image'
import Link from 'next/link'
import { urlForImage } from '@/lib/sanity/image'
import { homePageQuery } from '@/app/queries/homeQueries'
import HomeAnimations from '@/app/components/HomeAnimations'
import TeamCard from '@/app/components/TeamCard'
import MembershipForm from '@/app/components/MembershipForm'
import ExecomAvatar from '@/app/components/ExecomAvatar'

// Fallback data when Sanity has no content yet
const FALLBACK_EVENTS = [
  { _id: '1', dateLabel: 'MAR 2026', title: 'Engineering your own Path', eventType: 'IEEE Collab', link: null },
  { _id: '2', dateLabel: 'MAR 2026', title: 'Unseen Problem', eventType: 'IEEE Collab', link: null },
  { _id: '3', dateLabel: 'MAR 2026', title: 'Lumera', eventType: 'IEEE Collab', link: null },
  { _id: '4', dateLabel: 'MAR 2026', title: 'From dropshipping to building AI', eventType: 'IEEE Collab', link: null },
  { _id: '5', dateLabel: 'MAR 2026', title: 'SKILL MAAYA- 3 Day Learning Bootcamp', eventType: '3 Day Interactive Online Workshop', link: null },
  { _id: '6', dateLabel: 'JAN 2026', title: "Nexora 26'", eventType: "All Kerala Annual ISTE Student's Convention", link: null },
  { _id: '7', dateLabel: 'NOV 2025', title: 'Through My Younger Eyes Poster Challenge', eventType: 'Competition', link: null },
  { _id: '8', dateLabel: 'OCT 2025', title: 'Rising Tuskers', eventType: 'A Football based Fun event in collab with Kombans Fanatics', link: null },
  { _id: '9', dateLabel: 'OCT 2025', title: 'ISTE CONNECT', eventType: 'An Interactive session with new ISTE Members', link: null },

]

const FALLBACK_STATS = [
  { _id: 's1', label: 'Active Members', value: 300, suffix: '+' },
  { _id: 's2', label: 'Events Conducted', value: 50, suffix: '+' },
  { _id: 's3', label: 'Industry Partners', value: 5, suffix: '+' },
  { _id: 's4', label: 'Member Satisfaction', value: 95, suffix: '%' },
]

const FALLBACK_TESTIMONIALS = [
  { _id: 't1', quote: '"Performance is key for us, and joining ISTE was the best decision. Highly recommended for exposure."', authorName: 'Emily Watson', authorRole: '3rd Year CSE', avatarSeed: 'Emily' },
  { _id: 't2', quote: '"The aesthetics are top-notch. It gives my college experience a premium look without hiring a designer."', authorName: 'David Park', authorRole: 'Indie Hacker', avatarSeed: 'David' },
  { _id: 't3', quote: '"Finally, a community that actually considers accessibility and growth as a first-class citizen. A joy to be in."', authorName: 'Jessica Li', authorRole: 'UX Researcher', avatarSeed: 'Jessica' },
  { _id: 't4', quote: '"The peer-to-peer learning environment helped me land my first tech internship. Invaluable network."', authorName: 'Arjun M', authorRole: 'Tech Lead', avatarSeed: 'Arjun' },
]

const FALLBACK_EXECOM = {
  faculty: [
    { _id: 'f1', name: 'Melvin Jacob', initials: 'MJ', role: 'Faculty Advisor', category: 'faculty' },
    { _id: 'f2', name: 'Dr. Soumya A V', initials: 'S', role: 'Faculty Advisor', category: 'faculty' },
  ],
  mentors: [
    { _id: 'm1', name: 'Kiran Biju', initials: 'KB', role: 'Student Mentor', category: 'mentor' },
    { _id: 'm2', name: 'Krishna Prashanth', initials: 'KP', role: 'Student Mentor', category: 'mentor' },
  ],
  core: [
    { _id: 'c1', name: 'Aarya Ramesh', initials: 'AR', role: 'Chairperson', category: 'core' },
    { _id: 'c2', name: 'Snith Shibu', initials: 'SS', role: 'Vice Chairperson', category: 'core' },
    { _id: 'c3', name: 'Pushkala S S', initials: 'PS', role: 'Secretary', category: 'core' },
    { _id: 'c4', name: 'Sidharth Sumitra Gireesh', initials: 'SG', role: 'Treasurer', category: 'core' },
  ],
  teamLeads: [
    { _id: 'tl1', name: 'Jenza Mary Jose', initials: 'EM', role: 'Team Lead', team: 'Event Management Team', subMembers: [{ name: 'Adithyan M S', initials: 'AM' }, { name: 'Dhiya K', initials: 'DK' }, { name: 'Avantika Ajaykumar', initials: 'AA' }, { name: 'Devanandan P Unnithan', initials: 'DU' }, { name: 'Firose Muhammed S', initials: 'FM' }] },
    { _id: 'tl2', name: '[Design Lead]', initials: 'DT', role: 'Team Lead', team: 'Design Team', subMembers: [{ name: 'Devananda S R', initials: 'DS' }, { name: 'Neha Nevin', initials: 'NN' }] },
    { _id: 'tl3', name: 'Neil Philip Koshy', initials: 'ST', role: 'Team Lead', team: 'Sponsorship Team', subMembers: [{ name: 'Abhishek S S', initials: 'AS' }, { name: 'Christopher George', initials: 'CG' }] },
    { _id: 'tl4', name: 'Adhithya Mohan S', initials: 'PR', role: 'Team Lead', team: 'PR and Media Team', subMembers: [{ name: 'Rohin Daniel John', initials: 'RD' }, { name: 'Rogin', initials: 'RG' }, { name: 'Abhishek S', initials: 'AS' }, { name: 'Vishwabala P', initials: 'VP' }] },
    { _id: 'tl5', name: 'Aparna Rajagopal', initials: 'CD', role: 'Team Lead', team: 'Content & Documentation Team', subMembers: [{ name: 'Angelina R Nambiar', initials: 'AN' }, { name: 'Devikrishna A R', initials: 'DA' }, { name: 'Sneha A Oommen', initials: 'SO' }] },
    { _id: 'tl6', name: 'Angel Rose Prince', initials: 'SH', role: 'Team Lead', team: 'SHE Team', subMembers: [{ name: 'Adia Ani', initials: 'AA' }, { name: 'Aishwarya Balakrishnan Menon', initials: 'AB' }, { name: 'Anagha S', initials: 'AS' }] },
  ],
  junior: [
    { _id: 'j1', name: 'Govind Warrier', initials: 'GW', role: 'Event Management Team' },
    { _id: 'j2', name: 'S. Abarna Prasad', initials: 'AP', role: 'Event Management Team' },
    { _id: 'j3', name: 'R. Vishakh', initials: 'RV', role: 'Design Team' },
    { _id: 'j4', name: 'Charu B. Eshwar', initials: 'CB', role: 'Design Team' },
    { _id: 'j5', name: 'Gopika J.R.', initials: 'GJ', role: 'PR & Media Team' },
    { _id: 'j6', name: 'Eshan M.S.', initials: 'EM', role: 'PR & Media Team' },
    { _id: 'j7', name: 'R. Hari Krishnan', initials: 'RH', role: 'PR & Media Team' },
    { _id: 'j8', name: 'Sona Biju', initials: 'SB', role: 'PR & Media Team' },
    { _id: 'j9', name: 'Gourilekshmi Prashanth', initials: 'GP', role: 'PR & Media Team' },
    { _id: 'j10', name: 'Ashiya Noufal', initials: 'AN', role: 'SHE Team' },
    { _id: 'j11', name: 'Sreya Krishna', initials: 'SK', role: 'SHE Team' },
    { _id: 'j12', name: 'Ganga A.B.', initials: 'GA', role: 'Content & Documentation' },
  ],
}

const DELAY_CLASSES = ['', 'd1', 'd2', 'd3', 'd1', 'd2', 'd3', 'd4', '', 'd1', 'd2', 'd3']

export default async function Home() {
  const { isEnabled: preview } = await draftMode()

  let sanityData: any = null
  try {
    sanityData = await getClient(preview).fetch(homePageQuery, {}, {
      next: { revalidate: 60 }, // ISR: revalidate every 60 seconds
    })
  } catch (e) {
    // Sanity unreachable — fall through to hardcoded data
  }

  const events = sanityData?.events?.length ? sanityData.events : FALLBACK_EVENTS
  const stats = sanityData?.stats?.length ? sanityData.stats : FALLBACK_STATS
  const testimonials = sanityData?.testimonials?.length ? sanityData.testimonials : FALLBACK_TESTIMONIALS
  const settings = sanityData?.settings || {}
  const featuredInternships: any[] = sanityData?.featuredInternships || []
  const pillars: any[] = sanityData?.pillars || []
  const benefits: any[] = sanityData?.benefits || []

  const heroSubtitle = settings.heroSubtitle || 'Innovation · Technology · Excellence'
  const heroTypedText = settings.heroTypedText || "ISTE MBCET STUDENT'S CHAPTER"
  const heroDescription = settings.heroDescription || "The official student chapter of the Indian Society for Technical Education at Mar Baselios College of Engineering and Technology — where engineers build the future, faster."
  const heroPrimaryCta = settings.heroPrimaryCtaLabel || "Become a Member"
  const heroSecondaryCta = settings.heroSecondaryCtaLabel || "Explore Events"
  const navCta = settings.navCtaLabel || "Join Now"
  const footerTagline = settings.footerTagline || "Indian Society for Technical Education — Mar Baselios College of Engineering and Technology Student Chapter, Kerala."

  // Default ticker array if not provided in Sanity
  const tickerItems = settings.tickerItems?.length ? settings.tickerItems : [
    'Indian Society for Technical Education',
    'KE065',
    'Mar Baselios College of Engineering and Technology',
    'Innovate.',
    'Engineer.',
    'Inspire.'
  ]

  // Default perks if not provided in Sanity
  const membershipPerks = settings.membershipPerks?.length ? settings.membershipPerks : [
    'Official ISTE membership card — valid nationally',
    'Priority access to all chapter events and workshops',
    'ISTE journals, research publications & digital resources',
    'Exclusive internship & placement referral network',
    'Certificates of participation for every ISTE event'
  ]

  // Build execom lists from Sanity or fallback
  const members = sanityData?.execomMembers || []
  const faculty = members.filter((m: any) => m.category === 'faculty').length
    ? members.filter((m: any) => m.category === 'faculty')
    : FALLBACK_EXECOM.faculty
  const mentors = members.filter((m: any) => m.category === 'mentor').length
    ? members.filter((m: any) => m.category === 'mentor')
    : FALLBACK_EXECOM.mentors
  const core = members.filter((m: any) => m.category === 'core').length
    ? members.filter((m: any) => m.category === 'core')
    : FALLBACK_EXECOM.core
  const teamLeads = members.filter((m: any) => m.category === 'teamLead').length
    ? members.filter((m: any) => m.category === 'teamLead')
    : FALLBACK_EXECOM.teamLeads
  const junior = members.filter((m: any) => m.category === 'junior').length
    ? members.filter((m: any) => m.category === 'junior')
    : FALLBACK_EXECOM.junior

  // Duplicate testimonials for infinite scroll
  const allTestimonials = [...testimonials, ...testimonials]

  return (
    <>
      <HomeAnimations heroTypedText={heroTypedText} />

      <div className="c-dot" id="cdot"></div>
      <div className="c-ring" id="cring"></div>

      <div className="grid-lines">
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
        <div className="grid-line"></div>
      </div>

      <nav id="navbar">
        <a href="#hero" className="nav-logo"><Image src="/iste.png" alt="ISTE SC MBCET" width={40} height={40} className="logo-img" /><span>ISTE SC MBCET</span></a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#who">Who We Are</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#execom">ExeCom</a></li>
          <li><a href="#events">Events</a></li>
          <li><Link href="/internships" className="nav-link-highlight">Launchpad ✦</Link></li>
        </ul>
        <a href="#membership" className="nav-cta">{navCta}</a>
        <div className="nav-hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </nav>

      {/* ===== MOBILE MENU OVERLAY ===== */}
      <div className="mob-menu" id="mob-menu">
        <div className="mob-menu-inner">
          <button className="mob-close" id="mob-close" aria-label="Close menu">✕</button>
          <nav className="mob-nav">
            <a href="#about" className="mob-link" id="ml-1">About</a>
            <a href="#who" className="mob-link" id="ml-2">Who We Are</a>
            <a href="#benefits" className="mob-link" id="ml-3">Benefits</a>
            <a href="#execom" className="mob-link" id="ml-4">ExeCom</a>
            <a href="#events" className="mob-link" id="ml-5">Events</a>
            <Link href="/internships" className="mob-link mob-link--accent" id="ml-6">Internship Launchpad ✦</Link>
          </nav>
          <a href="#membership" className="mob-cta">{navCta} →</a>
          <div className="mob-footer">
            <a href="https://www.instagram.com/iste_mbcet/">Instagram</a>
            <a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a>
          </div>
        </div>
      </div>

      <section id="hero">
        <div className="hero-content">
          <h1 className="hero-headline" id="hero-headline">
            <span id="typed-out"></span>
            <span className="type-cursor" id="tcursor"></span>
          </h1>
          <div className="hero-divider" id="hero-div"></div>
          <p className="hero-sub" id="hero-sub">
            {heroDescription}
          </p>
          <div className="hero-dot-sep"><div className="badge-dot"></div></div>
          <div className="hero-ctas">
            <a href="#membership" className="hero-btn-primary">
              {heroPrimaryCta}
              <span className="hero-btn-arrow">→</span>
            </a>
            <a href="#events" className="hero-btn-secondary">
              {heroSecondaryCta} <span>→</span>
            </a>
          </div>
        </div>

        {/* Ever-looping Marquee Strip */}
        <div className="hero-ticker">
          <div className="hero-ticker-track">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="hero-ticker-set">
                {tickerItems.map((item: string, idx: number) => (
                  <span key={idx}>
                    <span className={`ticker-item ${idx % 2 === 0 ? 'ticker-italic' : ''}`}>{item}</span>
                    <span className="ticker-dash">—</span>
                  </span>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="about">
        <div className="section-inner about-grid">
          <div>
            <div className="section-tag reveal">About Us</div>
            <h2 className="section-title reveal d1" dangerouslySetInnerHTML={{ __html: settings.aboutTitle || 'Shaping <em>Engineers</em><br />of Tomorrow' }}></h2>

            {settings.aboutBody?.length ? (
              settings.aboutBody.map((block: any, i: number) => (
                <p key={i} className={`section-body reveal ${i === 0 ? 'd2' : 'd3'}`} style={{ marginTop: i === 0 ? 24 : 16 }}>
                  {block.children?.[0]?.text || ''}
                </p>
              ))
            ) : (
              <>
                <p className="section-body reveal d2" style={{ marginTop: 24 }}>
                  ISTE — the Indian Society for Technical Education — is India&apos;s premier national teachers association working
                  to enhance the quality of technical education. The MBCET Student Chapter brings this vision to life at
                  Mar Baselios College of Engineering and Technology, Nalanchira, Thiruvananthapuram.
                </p>
                <p className="section-body reveal d3" style={{ marginTop: 16 }}>
                  Founded with a mission to bridge the gap between academic knowledge and industry demands, our chapter equips
                  students with the skills, networks, and opportunities that transcend the classroom — cultivating a generation
                  of technically excellent and professionally ready engineers.
                </p>
              </>
            )}
          </div>
          <div className="about-visual reveal d2">
            <div className="about-box-main">
              <div className="about-code-label">Chapter Identifier</div>
              <div className="about-code-big">KE<br />065</div>
              <div className="about-code-sub">MBCET &nbsp;·&nbsp; Kerala</div>
            </div>
            <div className="about-box-inner"></div>
          </div>
        </div>
      </section>

      <section id="who">
        <div className="section-inner">
          <div className="who-header">
            <div className="section-tag reveal">Who Are We</div>
            <h2 className="section-title reveal d1">Built on Three<br /><em>Core Pillars</em></h2>
          </div>
          <div className="who-grid">
            {pillars.length > 0 ? (
              pillars.map((pillar: any, i: number) => (
                <div key={pillar._id} className={`who-card reveal ${i > 0 ? `d${i + 1}` : ''}`}>
                  <div className="who-num">{pillar.number}</div>
                  <h3 className="who-card-title">{pillar.title}</h3>
                  <p className="who-card-body">{pillar.body}</p>
                </div>
              ))
            ) : (
              <>
                <div className="who-card reveal">
                  <div className="who-num">01</div>
                  <h3 className="who-card-title">Community of Innovators</h3>
                  <p className="who-card-body">A dynamic collective of engineering students passionate about technology, problem-solving, and creating real-world impact through collaborative projects, events, and challenges.</p>
                </div>
                <div className="who-card reveal d2">
                  <div className="who-num">02</div>
                  <h3 className="who-card-title">Bridge to Industry</h3>
                  <p className="who-card-body">We connect students directly with industry professionals, alumni networks, and research organizations — providing exposure that transforms theoretical knowledge into professional competence.</p>
                </div>
                <div className="who-card reveal d3">
                  <div className="who-num">03</div>
                  <h3 className="who-card-title">Platform for Growth</h3>
                  <p className="who-card-body">From technical workshops and hackathons to leadership programs and national competitions, ISTE MBCET is your launchpad for holistic personal and professional excellence.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="stats">
        <div className="section-inner">
          <div className="stats-grid">
            {stats.map((stat: any, i: number) => (
              <div key={stat._id} className={`stat-item reveal ${DELAY_CLASSES[i] || ''}`}>
                <div className="stat-number">
                  <span className="countup" data-to={stat.value}>0</span>
                  <span className="stat-plus">{stat.suffix}</span>
                </div>
                <div className="stat-bar"></div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits">
        <div className="section-inner">
          <div className="section-tag reveal">Member Benefits</div>
          <h2 className="section-title reveal d1">Why Join<br /><em>ISTE MBCET?</em></h2>
          <div className="benefits-grid">
            {benefits.length > 0 ? (
              benefits.map((benefit: any, i: number) => (
                <div key={benefit._id} className={`benefit-card reveal ${i > 0 ? `d${i % 4}` : ''}`}>
                  <span className="benefit-icon">{benefit.icon}</span>
                  <h3 className="benefit-title">{benefit.title}</h3>
                  <p className="benefit-body">{benefit.body}</p>
                </div>
              ))
            ) : (
              <>
                <div className="benefit-card reveal">
                  <span className="benefit-icon">⚡</span>
                  <h3 className="benefit-title">Technical Workshops</h3>
                  <p className="benefit-body">Hands-on workshops on cutting-edge technologies — AI/ML, Web Development, IoT, Robotics, Embedded Systems — taught by industry experts.</p>
                </div>
                <div className="benefit-card reveal d1">
                  <span className="benefit-icon">🏆</span>
                  <h3 className="benefit-title">National Competitions</h3>
                  <p className="benefit-body">Represent MBCET at ISTE national-level contests, project expos, and hackathons. Build a portfolio that stands out to recruiters and graduate schools.</p>
                </div>
                <div className="benefit-card reveal d2">
                  <span className="benefit-icon">🌐</span>
                  <h3 className="benefit-title">Industry Networking</h3>
                  <p className="benefit-body">Connect with industry leaders, senior alumni, and professionals through exclusive events, guest talks, and company visits curated for our members.</p>
                </div>
                <div className="benefit-card reveal d1">
                  <span className="benefit-icon">📜</span>
                  <h3 className="benefit-title">Official ISTE Card</h3>
                  <p className="benefit-body">Receive a nationally recognized ISTE membership card, unlocking access to ISTE resources, academic journals, and nationwide student benefits.</p>
                </div>
                <div className="benefit-card reveal d2">
                  <span className="benefit-icon">🎓</span>
                  <h3 className="benefit-title">Leadership Development</h3>
                  <p className="benefit-body">Step into committee roles, lead cross-functional teams, and organize large-scale events that build real leadership, communication, and managerial skills.</p>
                </div>
                <div className="benefit-card reveal d3">
                  <span className="benefit-icon">🤝</span>
                  <h3 className="benefit-title">Internships &amp; Placements</h3>
                  <p className="benefit-body">Exclusive access to referrals, internship opportunities, and placement-drive invites shared within our trusted network of members and alumni.</p>
                </div>
              </>
            )}
          </div>
        </div>
      </section>

      <section id="execom">
        <div className="section-inner">
          <div className="section-tag reveal">Leadership 2025-26</div>
          <h2 className="section-title reveal d1">Executive<br /><em>Committee</em></h2>

          <div className="execom-sub-label reveal">Faculty Advisors</div>
          <div className="execom-core" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: 560 }}>
            {faculty.map((m: any, i: number) => (
              <div key={m._id} className={`execom-card reveal ${i > 0 ? 'd1' : ''}`}>
                <ExecomAvatar photo={m.photo} initials={m.initials} name={m.name} />
                <div className="execom-name">{m.name}</div>
                <div className="execom-role">{m.role}</div>
              </div>
            ))}
          </div>

          <div className="execom-sub-label reveal">Student Mentors</div>
          <div className="execom-core" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: 560 }}>
            {mentors.map((m: any, i: number) => (
              <div key={m._id} className={`execom-card reveal ${i > 0 ? 'd1' : ''}`}>
                <ExecomAvatar photo={m.photo} initials={m.initials} name={m.name} />
                <div className="execom-name">{m.name}</div>
                <div className="execom-role">{m.role}</div>
              </div>
            ))}
          </div>

          <div className="execom-sub-label reveal">Core Officers</div>
          <div className="execom-core">
            {core.map((m: any, i: number) => (
              <div key={m._id} className={`execom-card reveal ${DELAY_CLASSES[i] || ''}`}>
                <ExecomAvatar photo={m.photo} initials={m.initials} name={m.name} />
                <div className="execom-name">{m.name}</div>
                <div className="execom-role">{m.role}</div>
              </div>
            ))}
          </div>

          <div className="execom-sub-label reveal">Team Leads</div>
          <div className="execom-teams">
            {teamLeads.map((tl: any, i: number) => (
              <TeamCard
                key={tl._id}
                id={tl.initials}
                name={tl.name}
                team={tl.team || ''}
                delay={DELAY_CLASSES[i % 4]}
                subs={tl.subMembers || []}
                photo={tl.photo}
              />
            ))}
          </div>

          <div className="execom-sub-label reveal">Junior ExeCom</div>
          <div className="junior-grid">
            {junior.map((m: any, i: number) => (
              <div key={m._id} className={`junior-card reveal ${DELAY_CLASSES[i] || ''}`}>
                <ExecomAvatar photo={m.photo} initials={m.initials} name={m.name} size="sm" />
                <div className="junior-name">{m.name}</div>
                <div className="junior-role">{m.team || m.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="events">
        <div className="section-inner">
          <div className="section-tag reveal">Events</div>
          <h2 className="section-title reveal d1">Recent &amp;<br /><em>Upcoming</em></h2>
          <div className="events-list">
            {events.map((ev: any) => (
              <Link href={ev.slug ? `/events/${ev.slug}` : '#'} key={ev._id} className="event-row reveal">
                <div className="event-date">{ev.dateLabel}</div>
                <div className="event-info-main">
                  <div className="event-title">{ev.title}</div>
                  {ev.eventType && <div className="event-type">{ev.eventType}</div>}
                </div>
                {ev.galleryTeaser?.length > 0 && (
                  <div className="event-gallery-teaser">
                    {ev.galleryTeaser.map((img: any, i: number) => (
                      <div key={i} className="teaser-thumb" style={{ zIndex: 3 - i }}>
                        <img src={urlForImage(img).width(80).height(80).url()} alt="Gallery teaser" />
                      </div>
                    ))}
                  </div>
                )}
                <div className="event-arrow">→</div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section id="membership">
        <div className="section-inner">
          <div className="section-tag reveal">Enroll Now</div>
          <h2 className="section-title reveal d1">Grab Your<br /><em>Membership</em></h2>
          <div className="mem-glass-card reveal d2">
            <div className="mem-grid">
              <div className="mem-left">
                <p className="mem-body">
                  Becoming a member of ISTE MBCET Student Chapter is your gateway to technical excellence, peer networking,
                  and real-world professional growth. Fill in your details and we&apos;ll get you enrolled within 48 hours.
                </p>
                <div className="perks">
                  {membershipPerks.map((perk: string, i: number) => (
                    <div key={i} className="perk">
                      <div className="perk-check">✓</div>
                      {perk}
                    </div>
                  ))}
                </div>
              </div>
              <MembershipForm />
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="testi-header">
          <div className="section-tag">Member Voices</div>
          <h2 className="section-title">What Our<br /><em>Members Say</em></h2>
        </div>
        <div className="marquee-wrapper">
          <div className="marquee-content">
            {allTestimonials.map((t: any, i: number) => (
              <div key={`${t._id}-${i}`} className="testi-card">
                <div className="testi-quote-icon">&ldquo;</div>
                <div className="testi-text">{t.quote}</div>
                <div className="testi-divider"></div>
                <div className="testi-author">
                  <img
                    src={t.photo ? urlForImage(t.photo).width(80).height(80).url() : `https://api.dicebear.com/7.x/avataaars/svg?seed=${t.avatarSeed || t.authorName}`}
                    alt={t.authorName}
                  />
                  <div>
                    <div className="testi-name">{t.authorName}</div>
                    <div className="testi-role">{t.authorRole}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ===================== INTERNSHIP LAUNCHPAD TEASER ===================== */}
      <section id="launchpad" style={{ background: 'var(--black)', borderTop: '1px solid var(--border)' }}>
        <div className="section-inner">
          <div className="section-tag reveal">Member Resources</div>
          <div className="launchpad-teaser-grid">
            <div>
              <h2 className="section-title reveal d1">Internship<br /><em>Launchpad</em></h2>
              <p className="section-body reveal d2" style={{ marginTop: '24px' }}>
                Curated internship opportunities, verified and posted by the ISTE MBCET team — exclusively for our members.
              </p>
              <Link href="/internships" className="launchpad-cta reveal d3">
                Explore All Opportunities →
              </Link>
            </div>
            <div className="launchpad-preview">
              {featuredInternships.length > 0 ? (
                featuredInternships.map((intern: any, i: number) => (
                  <a
                    key={intern._id}
                    href={intern.applyLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`launchpad-preview-card reveal ${['d1', 'd2', 'd3'][i]}`}
                  >
                    <div className="lp-role">{intern.role}</div>
                    <div className="lp-company">{intern.company}</div>
                    <div className="lp-meta">
                      {intern.type && <span>{intern.type}</span>}
                      {intern.stipend && <span>{intern.stipend}</span>}
                    </div>
                    <div className="lp-arrow">→</div>
                  </a>
                ))
              ) : (
                <>
                  <div className="launchpad-preview-card reveal d1">
                    <div className="lp-role">Software Engineering Intern</div>
                    <div className="lp-company">TechCorp India</div>
                    <div className="lp-meta"><span>Remote</span><span>₹15,000/mo</span></div>
                    <div className="lp-arrow">→</div>
                  </div>
                  <div className="launchpad-preview-card reveal d2">
                    <div className="lp-role">UI/UX Design Intern</div>
                    <div className="lp-company">DesignHub Studios</div>
                    <div className="lp-meta"><span>Hybrid</span><span>₹10,000/mo</span></div>
                    <div className="lp-arrow">→</div>
                  </div>
                  <div className="launchpad-preview-card reveal d3">
                    <div className="lp-role">Data Science Intern</div>
                    <div className="lp-company">DataWave Analytics</div>
                    <div className="lp-meta"><span>Remote</span><span>₹12,000/mo</span></div>
                    <div className="lp-arrow">→</div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo"><Image src="/iste.png" alt="ISTE SC MBCET" width={80} height={80} className="footer-logo-img" /></div>
            <div className="footer-tagline">
              {footerTagline}
            </div>
            <div className="footer-chip">Chapter Code: {settings.chapterCode || 'KE065'}</div>
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#who">Who We Are</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#execom">ExeCom</a></li>
              <li><a href="#events">Events</a></li>
              <li><Link href="/internships">Internship Launchpad</Link></li>
              <li><a href="#membership">Join Now</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Follow Us</div>
            <ul className="footer-links">
              <li><a href={settings.instagramUrl || 'https://www.instagram.com/iste_mbcet/'}>Instagram</a></li>
              <li><a href={settings.linkedinUrl || 'https://www.linkedin.com/company/istescmbcet/'}>LinkedIn</a></li>
            </ul>
          </div>
          <div>
            <div className="footer-col-title">Contact</div>
            <ul className="footer-links">
              <li><a href={`mailto:${settings.contactEmail || 'istestudentchapter@mbcet.ac.in'}`}>{settings.contactEmail || 'istestudentchapter@mbcet.ac.in'}</a></li>
              <li><a href="#">MBCET, Nalanchira</a></li>
              <li><a href="#">Thiruvananthapuram</a></li>
              <li><a href="#">Kerala — 695 015</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <div className="footer-copy">© 2026 ISTE MBCET Student&apos;s Chapter &nbsp;·&nbsp; KE065. All rights reserved.</div>
          <div className="footer-socials">
            <a href={settings.instagramUrl || 'https://www.instagram.com/iste_mbcet/'}>Instagram</a>
            <a href={settings.linkedinUrl || 'https://www.linkedin.com/company/istescmbcet/'}>LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  )
}
