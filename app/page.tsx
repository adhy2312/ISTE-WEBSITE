'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

export default function Home() {
  const tcursorRef = useRef<HTMLSpanElement>(null);
  const typedSpanRef = useRef<HTMLSpanElement>(null);
  const heroDividerRef = useRef<HTMLDivElement>(null);
  const heroSubRef = useRef<HTMLParagraphElement>(null);

  // Custom Cursor state
  useEffect(() => {
    const cdot = document.getElementById('cdot');
    const cring = document.getElementById('cring');
    if (!cdot || !cring) return;

    let mx = 0, my = 0, rx = 0, ry = 0;
    let req: number;

    const handleMouseMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      cdot.style.left = mx + 'px';
      cdot.style.top = my + 'px';
    };

    const animRing = () => {
      rx += (mx - rx) * 0.12;
      ry += (my - ry) * 0.12;
      cring.style.left = rx + 'px';
      cring.style.top = ry + 'px';
      req = requestAnimationFrame(animRing);
    };

    document.addEventListener('mousemove', handleMouseMove);
    req = requestAnimationFrame(animRing);

    const interactiveEls = document.querySelectorAll('a, button, .execom-card, .event-row, .benefit-card, .who-card, .team-card');
    const enter = () => { cdot.classList.add('big'); cring.classList.add('big'); };
    const leave = () => { cdot.classList.remove('big'); cring.classList.remove('big'); };

    interactiveEls.forEach(el => {
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
    });

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(req);
      interactiveEls.forEach(el => {
        el.removeEventListener('mouseenter', enter);
        el.removeEventListener('mouseleave', leave);
      });
    };
  }, []);

  // Navbar Scroll
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;
    const handleScroll = () => {
      navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Hero Typing
  useEffect(() => {
    const HERO_TEXT = "ISTE MBCET STUDENT'S CHAPTER";
    const typedSpan = typedSpanRef.current;
    const tcursor = tcursorRef.current;
    const heroDivider = heroDividerRef.current;
    const heroSub = heroSubRef.current;

    let ti = 0;
    if (!typedSpan) return;
    typedSpan.textContent = '';

    const typeNext = () => {
      if (!typedSpan || !tcursor || !heroDivider || !heroSub) return;
      if (ti < HERO_TEXT.length) {
        typedSpan.textContent += HERO_TEXT[ti++];
        setTimeout(typeNext, 50);
      } else {
        tcursor.style.animation = 'none';
        tcursor.style.opacity = '1';
        setTimeout(() => {
          tcursor.classList.add('gone');
          heroDivider.classList.add('open');
        }, 600);
        setTimeout(() => heroSub.classList.add('show'), 900);
      }
    };
    const t = setTimeout(typeNext, 1000);
    return () => clearTimeout(t);
  }, []);

  // Scroll Reveal and Count-Up
  useEffect(() => {
    const ro = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.classList.add('visible');
          ro.unobserve(e.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

    document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

    const co = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (!e.isIntersecting) return;
        const el = e.target as HTMLElement;
        const targetAttr = el.getAttribute('data-to');
        if (!targetAttr) return;
        const target = +targetAttr;
        const dur = 1800;
        const step = target / (dur / 16);
        let cur = 0;
        const t = setInterval(() => {
          cur = Math.min(cur + step, target);
          el.textContent = Math.floor(cur).toString();
          if (cur >= target) {
            el.textContent = target.toString();
            clearInterval(t);
          }
        }, 16);
        co.unobserve(el);
      });
    }, { threshold: 0.5 });

    document.querySelectorAll('.countup').forEach(el => co.observe(el));

    return () => {
      ro.disconnect();
      co.disconnect();
    };
  }, []);

  const toggleTeam = (e: React.MouseEvent<HTMLDivElement>) => {
    const card = e.currentTarget;
    const isOpen = card.classList.contains('open');
    document.querySelectorAll('.team-card.open').forEach(c => c.classList.remove('open'));
    if (!isOpen) card.classList.add('open');
  };

  const submitForm = (e: React.FormEvent) => {
    e.preventDefault();
    const form = document.getElementById('mem-form');
    const success = document.getElementById('form-success');
    if (form && success) {
      form.style.display = 'none';
      success.style.display = 'block';
    }
  };

  return (
    <>
      <div className="c-dot" id="cdot"></div>
      <div className="c-ring" id="cring"></div>

      <nav id="navbar">
        <a href="#hero" className="nav-logo">ISTE&nbsp;<span>MBCET</span></a>
        <ul className="nav-links">
          <li><a href="#about">About</a></li>
          <li><a href="#who">Who We Are</a></li>
          <li><a href="#benefits">Benefits</a></li>
          <li><a href="#execom">ExeCom</a></li>
          <li><a href="#events">Events</a></li>
        </ul>
        <a href="#membership" className="nav-cta">Join Now</a>
        <div className="nav-hamburger" id="hamburger">
          <span></span><span></span><span></span>
        </div>
      </nav>

      <section id="hero">
        <div className="hero-content">
          <div className="hero-badge">
            <div className="badge-dot"></div>
            Student Chapter Code &nbsp;KE065
          </div>

          <h1 className="hero-headline" id="hero-headline">
            <span ref={typedSpanRef} id="typed-out"></span>
            <span ref={tcursorRef} className="type-cursor" id="tcursor"></span>
          </h1>

          <div ref={heroDividerRef} className="hero-divider" id="hero-div"></div>
          <p ref={heroSubRef} className="hero-sub" id="hero-sub">Innovation &middot; Technology &middot; Excellence</p>
        </div>

        <div className="hero-scroll">
          <div className="scroll-line"></div>
          Scroll
        </div>
      </section>

      <section id="about">
        <div className="section-inner about-grid">
          <div>
            <div className="section-tag reveal">About Us</div>
            <h2 className="section-title reveal d1">Shaping <em>Engineers</em><br />of Tomorrow</h2>
            <p className="section-body reveal d2" style={{ marginTop: 24 }}>
              ISTE — the Indian Society for Technical Education — is India's premier national teachers association working
              to enhance the quality of technical education. The MBCET Student Chapter brings this vision to life at
              Mar Baselios College of Engineering and Technology, Nalanchira, Thiruvananthapuram.
            </p>
            <p className="section-body reveal d3" style={{ marginTop: 16 }}>
              Founded with a mission to bridge the gap between academic knowledge and industry demands, our chapter equips
              students with the skills, networks, and opportunities that transcend the classroom — cultivating a generation
              of technically excellent and professionally ready engineers.
            </p>
          </div>
          <div className="about-visual reveal d2">
            <div className="about-box-main">
              <div className="about-code-label">Chapter Identifier</div>
              <div className="about-code-big">KE<br />065</div>
              <div className="about-code-sub">MBCET &nbsp;&middot;&nbsp; Kerala</div>
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
          </div>
        </div>
      </section>

      <section id="stats">
        <div className="section-inner">
          <div className="stats-grid">
            <div className="stat-item reveal">
              <div className="stat-number"><span className="countup" data-to="300">0</span><span className="stat-plus">+</span></div>
              <div className="stat-bar"></div>
              <div className="stat-label">Active Members</div>
            </div>
            <div className="stat-item reveal d2">
              <div className="stat-number"><span className="countup" data-to="50">0</span><span className="stat-plus">+</span></div>
              <div className="stat-bar"></div>
              <div className="stat-label">Events Conducted</div>
            </div>
            <div className="stat-item reveal d3">
              <div className="stat-number"><span className="countup" data-to="5">0</span><span className="stat-plus">+</span></div>
              <div className="stat-bar"></div>
              <div className="stat-label">Industry Partners</div>
            </div>
            <div className="stat-item reveal d4">
              <div className="stat-number"><span className="countup" data-to="95">0</span><span className="stat-plus">%</span></div>
              <div className="stat-bar"></div>
              <div className="stat-label">Member Satisfaction</div>
            </div>
          </div>
        </div>
      </section>

      <section id="benefits">
        <div className="section-inner">
          <div className="section-tag reveal">Member Benefits</div>
          <h2 className="section-title reveal d1">Why Join<br /><em>ISTE MBCET?</em></h2>
          <div className="benefits-grid">
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
              <h3 className="benefit-title">Internships & Placements</h3>
              <p className="benefit-body">Exclusive access to referrals, internship opportunities, and placement-drive invites shared within our trusted network of members and alumni.</p>
            </div>
          </div>
        </div>
      </section>

      <section id="execom">
        <div className="section-inner">
          <div className="section-tag reveal">Leadership 2024–25</div>
          <h2 className="section-title reveal d1">Executive<br /><em>Committee</em></h2>

          <div className="execom-sub-label reveal">Faculty Advisors</div>
          <div className="execom-core" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: 560 }}>
            <div className="execom-card reveal">
              <div className="execom-avatar">MJ</div>
              <div className="execom-name">Melvin Jacob</div>
              <div className="execom-role">Faculty Advisor</div>
            </div>
            <div className="execom-card reveal d1">
              <div className="execom-avatar">S</div>
              <div className="execom-name">Dr. Soumya A V</div>
              <div className="execom-role">Faculty Advisor</div>
            </div>
          </div>

          <div className="execom-sub-label reveal">Student Mentors</div>
          <div className="execom-core" style={{ gridTemplateColumns: 'repeat(2,1fr)', maxWidth: 560 }}>
            <div className="execom-card reveal">
              <div className="execom-avatar">KB</div>
              <div className="execom-name">Kiran Biju</div>
              <div className="execom-role">Student Mentor</div>
            </div>
            <div className="execom-card reveal d1">
              <div className="execom-avatar">KP</div>
              <div className="execom-name">Krishna Prashanth</div>
              <div className="execom-role">Student Mentor</div>
            </div>
          </div>

          <div className="execom-sub-label reveal">Core Officers</div>

          <div className="execom-core">
            <div className="execom-card reveal">
              <div className="execom-avatar">AR</div>
              <div className="execom-name">Aarya Ramesh</div>
              <div className="execom-role">Chairperson</div>
            </div>
            <div className="execom-card reveal d1">
              <div className="execom-avatar">SS</div>
              <div className="execom-name">Snith Shibu</div>
              <div className="execom-role">Vice Chairperson</div>
            </div>
            <div className="execom-card reveal d2">
              <div className="execom-avatar">PS</div>
              <div className="execom-name">Pushkala S S</div>
              <div className="execom-role">Secretary</div>
            </div>
            <div className="execom-card reveal d3">
              <div className="execom-avatar">SG</div>
              <div className="execom-name">Sidharth Sumitra Gireesh</div>
              <div className="execom-role">Treasurer</div>
            </div>
          </div>

          <div className="execom-sub-label reveal">Team Leads</div>
          <div className="execom-teams">
            {[
              { id: 'EM', name: 'Jenza Mary Jose', team: 'Event Management Team', subs: [{ id: 'AM', name: 'Adithyan M S' }, { id: 'DK', name: 'Dhiya K' }, { id: 'AA', name: 'Avantika Ajaykumar' }, { id: 'DU', name: 'Devanandan P Unnithan' }, { id: 'FM', name: 'Firose Muhammed S' }] },
              { id: 'DT', name: '[Design Lead]', team: 'Design Team', delay: 'd1', subs: [{ id: 'DS', name: 'Devananda S R' }, { id: 'NN', name: 'Neha Nevin' }] },
              { id: 'ST', name: 'Neil Philip Koshy', team: 'Sponsorship Team', delay: 'd2', subs: [{ id: 'AS', name: 'Abhishek S S' }, { id: 'CG', name: 'Christopher George' }] },
              { id: 'PR', name: 'Adhithya Mohan S', team: 'PR and Media Team', delay: 'd1', subs: [{ id: 'RD', name: 'Rohin Daniel John' }, { id: 'RG', name: 'Rogin' }, { id: 'AS', name: 'Abhishek S' }, { id: 'VP', name: 'Vishwabala P' }] },
              { id: 'CD', name: 'Aparna Rajagopal', team: 'Content & Documentation Team', delay: 'd2', subs: [{ id: 'AN', name: 'Angelina R Nambiar' }, { id: 'DA', name: 'Devikrishna A R' }, { id: 'SO', name: 'Sneha A Oommen' }] },
              { id: 'SH', name: 'Angel Rose Prince', team: 'SHE Team', delay: 'd3', subs: [{ id: 'AA', name: 'Adia Ani' }, { id: 'AB', name: 'Aishwarya Balakrishnan Menon' }, { id: 'AS', name: 'Anagha S' }] },
            ].map((team, idx) => (
              <div key={idx} className={`team-card reveal ${team.delay || ''}`} onClick={toggleTeam}>
                <div className="team-head">
                  <div className="team-head-left">
                    <div className="team-avatar">{team.id}</div>
                    <div className="team-info">
                      <div className="team-name">{team.name}</div>
                      <div className="team-label">{team.team}</div>
                    </div>
                  </div>
                  <div className="team-toggle">▾</div>
                </div>
                <div className="team-subs">
                  {team.subs.map((sub, sIdx) => (
                    <div key={sIdx} className="sub-member">
                      <div className="sub-avatar">{sub.id}</div>
                      <div><div className="sub-name">{sub.name}</div><div className="sub-role">Sub-head</div></div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="execom-sub-label reveal">Junior ExeCom</div>
          <div className="junior-grid">
            {[
              { id: 'GW', name: 'Govind Warrier', role: 'Event Management Team' },
              { id: 'AP', name: 'S. Abarna Prasad', role: 'Event Management Team' },
              { id: 'RV', name: 'R. Vishakh', role: 'Design Team' },
              { id: 'CB', name: 'Charu B. Eshwar', role: 'Design Team' },
              { id: 'GJ', name: 'Gopika J.R.', role: 'PR & Media Team' },
              { id: 'EM', name: 'Eshan M.S.', role: 'PR & Media Team' },
              { id: 'RH', name: 'R. Hari Krishnan', role: 'PR & Media Team' },
              { id: 'SB', name: 'Sona Biju', role: 'PR & Media Team' },
              { id: 'GP', name: 'Gourilekshmi Prashanth', role: 'PR & Media Team' },
              { id: 'AN', name: 'Ashiya Noufal', role: 'SHE Team' },
              { id: 'SK', name: 'Sreya Krishna', role: 'SHE Team' },
              { id: 'GA', name: 'Ganga A.B.', role: 'Content & Documentation' },
            ].map((m, i) => (
              <div key={i} className={`junior-card reveal ${['', 'd1', 'd2', 'd3', 'd1', 'd2', 'd3', 'd4', '', 'd1', 'd2', 'd3'][i]}`}>
                <div className="junior-avatar">{m.id}</div>
                <div className="junior-name">{m.name}</div>
                <div className="junior-role">{m.role}</div>
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
            <div className="event-row reveal">
              <div className="event-date">MAR 2026</div>
              <div>
                <div className="event-title">Engineering your own Path</div>
                <div className="event-type">IEEE Collab &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">MAR 2026</div>
              <div>
                <div className="event-title">Unseen Problem</div>
                <div className="event-type">IEEE Collab &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">MAR 2026</div>
              <div>
                <div className="event-title">Lumera</div>
                <div className="event-type">IEEE Collab &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">MAR 2026</div>
              <div>
                <div className="event-title">From dropshipping to building AI</div>
                <div className="event-type">IEEE Collab &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">MAR 2026</div>
              <div>
                <div className="event-title">SKILL MAAYA- 3 Day Learning Bootcamp</div>
                <div className="event-type">3 Day Interactive Online Workshop &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">JAN 2026</div>
              <div>
                <div className="event-title">Nexora 26'</div>
                <div className="event-type">All Kerala Annual ISTE Student's Convention &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">NOV 2025</div>
              <div>
                <div className="event-title">Through My Younger Eyes Poster Challenge</div>
                <div className="event-type">Competition &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">OCT 2025</div>
              <div>
                <div className="event-title">Rising Tuskers</div>
                <div className="event-type">A Footbal based Fun event in collab with Kombans Fanatics &middot;</div>
              </div>
              <div className="event-arrow">→</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">OCT 2025</div>
              <div>
                <div className="event-title">ISTE CONNECT</div>
                <div className="event-type">An Interactive session with new ISTE Members &middot;</div>
              </div>
              <div className="event-arrow">&rarr;</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">FEB 2025</div>
              <div>
                <div className="event-title">KeralaHack 2025</div>
                <div className="event-type">24-Hour Hackathon</div>
              </div>
              <div className="event-arrow">&rarr;</div>
            </div>
            <div className="event-row reveal">
              <div className="event-date">JAN 2025</div>
              <div>
                <div className="event-title">Industry Connect — ISRO Alumni Talk</div>
                <div className="event-type">Speaker Session</div>
              </div>
              <div className="event-arrow">&rarr;</div>
            </div>
          </div>
        </div>
      </section>

      <section id="membership">
        <div className="section-inner">
          <div className="section-tag reveal">Enroll Now</div>
          <h2 className="section-title reveal d1">Grab Your<br /><em>Membership</em></h2>
          <div className="mem-grid">
            <div>
              <p className="mem-body reveal">
                Becoming a member of ISTE MBCET Student Chapter is your gateway to technical excellence, peer networking,
                and real-world professional growth. Fill in your details and we'll get you enrolled within 48 hours.
              </p>
              <div className="perks">
                <div className="perk reveal d1"><div className="perk-check">✓</div>Official ISTE membership card — valid nationally</div>
                <div className="perk reveal d2"><div className="perk-check">✓</div>Priority access to all chapter events and workshops</div>
                <div className="perk reveal d3"><div className="perk-check">✓</div>ISTE journals, research publications & digital resources</div>
                <div className="perk reveal d4"><div className="perk-check">✓</div>Exclusive internship &amp; placement referral network</div>
                <div className="perk reveal d5"><div className="perk-check">✓</div>Certificates of participation for every ISTE event</div>
              </div>
            </div>
            <div className="mem-form reveal d2">
              <form id="mem-form" onSubmit={submitForm}>
                <div className="form-head">Apply for Membership</div>
                <div className="form-sub">One-time enrollment &nbsp;&middot;&nbsp; Students only</div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="fn">First Name</label>
                    <input type="text" id="fn" placeholder="Arjun" required />
                  </div>
                  <div className="form-group">
                    <label htmlFor="ln">Last Name</label>
                    <input type="text" id="ln" placeholder="Menon" required />
                  </div>
                </div>
                <div className="form-group">
                  <label htmlFor="em">Email Address</label>
                  <input type="email" id="em" placeholder="you@mbcet.ac.in" required />
                </div>
                <div className="form-group">
                  <label htmlFor="ph">Phone Number</label>
                  <input type="tel" id="ph" placeholder="+91 98765 43210" required />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="dp">Department</label>
                    <select id="dp" required>
                      <option value="">Select</option>
                      <option>Computer Science Engineering</option>
                      <option>CSE with AI</option>
                      <option>Electronics &amp; Communication</option>
                      <option>Electrical &amp; Computer Engineering</option>
                      <option>Electrical Engineering</option>
                      <option>Mechanical Engineering</option>
                      <option>Civil Engineering</option>
                      <option>Other</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label htmlFor="yr">Year of Study</label>
                    <select id="yr" required>
                      <option value="">Select</option>
                      <option>1st Year</option>
                      <option>2nd Year</option>
                      <option>3rd Year</option>
                      <option>4th Year</option>
                    </select>
                  </div>
                </div>
                <button type="submit" className="form-btn" id="form-btn">Submit Application →</button>
                <div className="form-note">We'll reach out within 48 hours of submission.</div>
              </form>
              <div className="form-success" id="form-success">
                <div className="form-success-icon">✓</div>
                <div className="form-success-title">Application Received!</div>
                <div className="form-success-sub">We'll contact you within 48 hours.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="testimonials" className="testimonials-section">
        <div className="testi-header">
          <h2>Testimonials</h2>
        </div>

        <div className="marquee-wrapper">
          <div className="marquee-content">
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"Performance is key for us, and joining ISTE was the best decision. Highly recommended for exposure."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" alt="Emily Watson" />
                <div>
                  <div className="testi-name">Emily Watson</div>
                  <div className="testi-role">3rd Year CSE</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"The aesthetics are top-notch. It gives my college experience a premium look without hiring a designer."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" alt="David Park" />
                <div>
                  <div className="testi-name">David Park</div>
                  <div className="testi-role">Indie Hacker</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"Finally, a community that actually considers accessibility and growth as a first-class citizen. A joy to be in."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" alt="Jessica Li" />
                <div>
                  <div className="testi-name">Jessica Li</div>
                  <div className="testi-role">UX Researcher</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"The peer-to-peer learning environment helped me land my first tech internship. Invaluable network."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="Arjun M" />
                <div>
                  <div className="testi-name">Arjun M</div>
                  <div className="testi-role">Tech Lead</div>
                </div>
              </div>
            </div>

            {/* Duplicates for infinite scroll */}
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"Performance is key for us, and joining ISTE was the best decision. Highly recommended for exposure."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Emily" alt="Emily Watson" />
                <div>
                  <div className="testi-name">Emily Watson</div>
                  <div className="testi-role">3rd Year CSE</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"The aesthetics are top-notch. It gives my college experience a premium look without hiring a designer."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=David" alt="David Park" />
                <div>
                  <div className="testi-name">David Park</div>
                  <div className="testi-role">Indie Hacker</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"Finally, a community that actually considers accessibility and growth as a first-class citizen. A joy to be in."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica" alt="Jessica Li" />
                <div>
                  <div className="testi-name">Jessica Li</div>
                  <div className="testi-role">UX Researcher</div>
                </div>
              </div>
            </div>
            <div className="testi-card">
              <div className="testi-quote-icon">“</div>
              <div className="testi-text">"The peer-to-peer learning environment helped me land my first tech internship. Invaluable network."</div>
              <div className="testi-divider"></div>
              <div className="testi-author">
                <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Arjun" alt="Arjun M" />
                <div>
                  <div className="testi-name">Arjun M</div>
                  <div className="testi-role">Tech Lead</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <footer>
        <div className="footer-top">
          <div>
            <div className="footer-logo">ISTE MBCET</div>
            <div className="footer-tagline">
              Indian Society for Technical Education — Mar Baselios College of Engineering and Technology Student Chapter, Kerala.
            </div>
            <div className="footer-chip">Chapter Code: KE065</div>
          </div>
          <div>
            <div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#who">Who We Are</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#execom">ExeCom</a></li>
              <li><a href="#events">Events</a></li>
              <li><a href="#membership">Join Now</a></li>
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
          <div className="footer-copy">© 2026 ISTE MBCET Student's Chapter &nbsp;&middot;&nbsp; KE065. All rights reserved.</div>
          <div className="footer-socials">
            <a href="https://www.instagram.com/iste_mbcet/">Instagram</a>
            <a href="https://www.linkedin.com/company/istescmbcet/">LinkedIn</a>
          </div>
        </div>
      </footer>
    </>
  );
}
