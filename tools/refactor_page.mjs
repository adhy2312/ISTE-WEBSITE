import fs from 'fs';
import path from 'path';

const file = path.join(process.cwd(), 'app', 'page.tsx');
let content = fs.readFileSync(file, 'utf8');

// Update imports
content = content.replace(
  `import { PortableText } from '@portabletext/react'`,
  `import { PortableText } from '@portabletext/react'\nimport { faqsQuery } from '@/app/queries/homeQueries'`
);

// Update variables
content = content.replace(
  `const benefits: any[] = sanityData?.benefits || []`,
  `const benefits: any[] = sanityData?.benefits || []\n  const homePage = sanityData?.homePage || { sections: [] }\n  const navigationMenu = sanityData?.navigationMenu || {}`
);

// Extract the entire return block starting at `return (` and ending at the last `)` of the component
const returnMatch = content.match(/return \([\s\S]*?^}/m);
if (!returnMatch) throw new Error("Could not find return block");

let returnBlock = returnMatch[0];

// The sections to extract
const sections = [
  'active-events',
  'about',
  'who',
  'stats',
  'benefits',
  'execom',
  'events',
  'membership',
  'launchpad'
];

let extractedFunctions = '';
const extractedSectionMap = {};

for (const id of sections) {
  // Regex to extract `<section id="ID">...</section>`
  // Using a robust state machine or simple regex since we know the structure
  const regex = new RegExp(`(<section id="${id}"[\\s\\S]*?<\\/section>)`);
  const match = returnBlock.match(regex);
  if (match) {
    const fullSection = match[1];
    returnBlock = returnBlock.replace(fullSection, `\n      {/* EXTRACTED ${id} */}\n`);
    const functionName = 'render' + id.split('-').map(s => s.charAt(0).toUpperCase() + s.slice(1)).join('');
    
    extractedFunctions += `\n  const ${functionName} = () => {\n    return (\n      ${fullSection}\n    )\n  }\n`;
  } else if (id === 'launchpad') {
      const regexLaunchpad = /({\/\* =+ INTERNSHIP LAUNCHPAD TEASER =+ \*\/}\s*<section id="launchpad"[\s\S]*?<\/section>)/;
      const match2 = returnBlock.match(regexLaunchpad);
      if(match2) {
        const fullSection = match2[1];
        returnBlock = returnBlock.replace(fullSection, `\n      {/* EXTRACTED ${id} */}\n`);
        extractedFunctions += `\n  const renderLaunchpad = () => {\n    return (\n      ${fullSection}\n    )\n  }\n`;
      }
  }
}

// Add FAQ section manually since it's new
extractedFunctions += `
  const renderFaq = () => {
    const faqs = sanityData?.faqs || []
    if (faqs.length === 0) return null
    return (
      <section id="faq" key="faq" style={{ padding: '80px 0' }}>
        <div className="section-inner">
          <div className="section-tag reveal">{settings.faqTag || 'Got Questions?'}</div>
          <h2 className="section-title reveal d1" dangerouslySetInnerHTML={{ __html: settings.faqTitle || 'Frequently Asked<br /><em>Questions</em>' }}></h2>
          <div className="faq-list mt-8">
            {faqs.map((faq: any, i: number) => (
              <div key={faq._id} className={\`faq-item reveal \${DELAY_CLASSES[i] || ''}\`} style={{ marginBottom: 24, padding: 24, background: 'rgba(255,255,255,0.02)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
                <h3 style={{ fontSize: '1.2rem', marginBottom: 12 }}>{faq.question}</h3>
                <p style={{ color: 'rgba(255,255,255,0.6)', lineHeight: 1.6 }}>{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }
`;

// Add dynamic ordering logic
const logicCode = `
  const sectionRenderers: Record<string, () => React.ReactNode> = {
    hero: () => null, // Hero is rendered statically at top
    activeEvents: renderActiveEvents,
    about: renderAbout,
    who: renderWho,
    stats: renderStats,
    benefits: renderBenefits,
    execom: renderExecom,
    events: renderEvents,
    membership: renderMembership,
    launchpad: renderLaunchpad,
    faq: renderFaq,
  }

  const defaultOrder = ['activeEvents', 'about', 'who', 'stats', 'benefits', 'execom', 'events', 'membership', 'launchpad', 'faq']
  let sectionsToRender = []

  if (homePage?.sections?.length > 0) {
    sectionsToRender = homePage.sections
      .filter((s: any) => s.visible !== false)
      .map((s: any) => s.sectionId)
  } else {
    sectionsToRender = defaultOrder
  }

  const navLinks = navigationMenu?.mainLinks || [
    { label: 'About', href: '#about' },
    { label: 'Who We Are', href: '#who' },
    { label: 'Benefits', href: '#benefits' },
    { label: 'ExeCom', href: '#execom' },
    { label: 'Events', href: '#events' },
    { label: 'Launchpad ✦', href: '/internships', isHighlighted: true },
  ]
  const footerCols = navigationMenu?.footerColumns || []
`;

// Clean up the return block by removing the extracted placeholders
sections.forEach(id => {
  returnBlock = returnBlock.replace(`\n      {/* EXTRACTED ${id} */}\n`, '');
});

// Inject dynamic sections renderer into the return block right before footer
returnBlock = returnBlock.replace(
  '      <footer>',
  `      {/* CMS Driven Sections */}
      {sectionsToRender.map((sectionId: string) => {
        const renderFunc = sectionRenderers[sectionId]
        if (renderFunc) return renderFunc()
        return null
      })}

      <footer>`
);

// Update styling block
returnBlock = returnBlock.replace(
  '<HomeAnimations heroTypedText={heroTypedText} />',
  `<style dangerouslySetInnerHTML={{
        __html: \`
          :root {
            \${settings.primaryColor ? '--c-main: ' + settings.primaryColor.replace('#', '') + ';' : ''}
            \${settings.accentColor ? '--c-alt1: ' + settings.accentColor.replace('#', '') + ';' : ''}
          }
        \`
      }} />
      <HomeAnimations heroTypedText={heroTypedText} />`
);

// Update nav loops
returnBlock = returnBlock.replace(
  /<ul className="nav-links"[\s\S]*?<\/ul>/,
  `<ul className="nav-links" role="menubar">
          {navLinks.map((link: any, i: number) => (
            <li role="none" key={i}>
              {link.isHighlighted ? (
                <Link role="menuitem" href={link.href} className="nav-link-highlight">
                  {link.label} {link.highlightSuffix || ''}
                </Link>
              ) : (
                <a role="menuitem" href={link.href}>{link.label}</a>
              )}
            </li>
          ))}
        </ul>`
);

// Mobile nav loops
returnBlock = returnBlock.replace(
  /<nav className="mob-nav"[\s\S]*?<\/nav>/,
  `<nav className="mob-nav" aria-label="Mobile Navigation">
            {navLinks.map((link: any, i: number) => (
              link.isHighlighted ? (
                <Link href={link.href} key={i} className="mob-link mob-link--accent" id={\`ml-\${i+1}\`}>{link.label} {link.highlightSuffix || ''}</Link>
              ) : (
                <a href={link.href} key={i} className="mob-link" id={\`ml-\${i+1}\`}>{link.label}</a>
              )
            ))}
          </nav>`
);

// Footer loops
const footerLinksStr = `<div className="footer-col-title">Navigate</div>
            <ul className="footer-links">
              <li><a href="#about">About</a></li>
              <li><a href="#who">Who We Are</a></li>
              <li><a href="#benefits">Benefits</a></li>
              <li><a href="#execom">ExeCom</a></li>
              <li><a href="#events">Events</a></li>
              <li><Link href="/internships">Internship Launchpad</Link></li>
              <li><a href="#membership">Join Now</a></li>
            </ul>`;

returnBlock = returnBlock.replace(
  footerLinksStr,
  `{footerCols.map((col: any, i: number) => (
              <div key={i} style={{ marginBottom: 24 }}>
                <div className="footer-col-title">{col.title}</div>
                <ul className="footer-links">
                  {col.links?.map((link: any, j: number) => (
                    <li key={j}><a href={link.href}>{link.label}</a></li>
                  ))}
                </ul>
              </div>
            ))}
            {footerCols.length === 0 && (
              <>
                ${footerLinksStr}
              </>
            )}`
);

// Cta replacements
returnBlock = returnBlock.replace(/<a href="#membership" className="nav-cta"[\s\S]*?<\/a>/, `<a href={navigationMenu?.ctaHref || "#membership"} className="nav-cta" aria-label="Navigate to Membership Form">{navigationMenu?.ctaLabel || navCta}</a>`);
returnBlock = returnBlock.replace(/<a href="#membership" className="mob-cta"[\s\S]*?<\/a>/, `<a href={navigationMenu?.ctaHref || "#membership"} className="mob-cta" aria-label="Navigate to Membership Form">{navigationMenu?.ctaLabel || navCta} →</a>`);

// Logo replacement
returnBlock = returnBlock.replace(
  /<Image src="\/iste\.png" alt="ISTE SC MBCET Logo" width={40} height={40} className="logo-img" priority \/>\n\s*<span>ISTE SC MBCET<\/span>/,
  `<Image src={settings.logoImage ? urlForImage(settings.logoImage).width(80).url() : "/iste.png"} alt={settings.siteTitle || "ISTE SC MBCET Logo"} width={40} height={40} className="logo-img" priority />
          <span>{settings.siteTitle || "ISTE SC MBCET"}</span>`
);

// Compile new content
const newReturnBlock = extractedFunctions + '\\n' + logicCode + '\\n' + returnBlock;
content = content.replace(returnMatch[0], newReturnBlock);

// Testimonials removal
const testimonialSectionStr = `      <section id="testimonials">
        <div className="section-inner">
          <div className="section-tag reveal">{settings.testimonialsTag || 'Member Voices'}</div>
          <h2 className="section-title reveal d1" dangerouslySetInnerHTML={{ __html: settings.testimonialsTitle || 'What Our<br /><em>Members Say</em>' }}></h2>
          {/* Testimonial slider implementation here */}
        </div>
      </section>`;
// Actually, testimonials section doesn't exist in page.tsx except in sanity fields. We removed testimonials from queries.

fs.writeFileSync(file, content);
console.log("Success!");
