import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — handled in structure builder
  fields: [
    defineField({
      name: 'heroHeadline',
      title: 'Hero Headline',
      description: 'The main big cinematic text.',
      type: 'string',
    }),
    defineField({
      name: 'heroDescription',
      title: 'Hero Description',
      description: 'The subtext under the cinematic headline.',
      type: 'string',
    }),
    defineField({
      name: 'heroSubtitle',
      title: 'Hero Subtitle',
      description: 'Shown below the animated heading. e.g. "Innovation · Technology · Excellence"',
      type: 'string',
    }),
    defineField({
      name: 'heroTypedText',
      title: 'Hero Typed Text',
      description: 'The animated typing text in the hero. e.g. "ISTE MBCET STUDENT\'S CHAPTER"',
      type: 'string',
    }),
    defineField({
      name: 'heroPrimaryCtaLabel',
      title: 'Hero Primary CTA Label',
      description: 'e.g. "Become a Member"',
      type: 'string',
    }),
    defineField({
      name: 'heroSecondaryCtaLabel',
      title: 'Hero Secondary CTA Label',
      description: 'e.g. "Explore Events"',
      type: 'string',
    }),
    defineField({
      name: 'heroStatsLabel',
      title: 'Hero Stats Label',
      description: 'Text shown next to the active members stat. e.g. "members are already part of the chapter"',
      type: 'string',
      initialValue: 'members are already part of the chapter',
    }),
    defineField({
      name: 'tickerItems',
      title: 'Ticker Strip Items',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'aboutTitle',
      title: 'About Section Title',
      type: 'string',
    }),
    defineField({
      name: 'aboutBody',
      title: 'About Body Paragraphs',
      type: 'array',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'membershipPerks',
      title: 'Membership Perks',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'membershipEnabled',
      title: 'Accepting Memberships',
      description: 'Toggle whether the membership application form is open.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'membershipClosedMessage',
      title: 'Membership Closed Message',
      description: 'Message to show when membership applications are closed.',
      type: 'string',
      initialValue: 'Membership applications are currently closed. Please check back later.',
    }),
    defineField({
      name: 'navCtaLabel',
      title: 'Navbar CTA Label',
      description: 'e.g. "Join Now"',
      type: 'string',
    }),
    defineField({
      name: 'footerTagline',
      title: 'Footer Tagline',
      type: 'text',
    }),
    defineField({
      name: 'footerCopyright',
      title: 'Footer Copyright Text',
      type: 'string',
      initialValue: '© 2026 ISTE MBCET Student\'s Chapter. All rights reserved.',
    }),
    defineField({
      name: 'footerVersion',
      title: 'Footer Version Watermark',
      description: 'Small version text shown in the footer corner (e.g. "v11.2")',
      type: 'string',
      initialValue: 'v11.2',
    }),
    defineField({
      name: 'footerAddressLine1',
      title: 'Footer Address Line 1',
      type: 'string',
      initialValue: 'MBCET, Nalanchira',
    }),
    defineField({
      name: 'footerAddressLine2',
      title: 'Footer Address Line 2',
      type: 'string',
      initialValue: 'Thiruvananthapuram',
    }),
    defineField({
      name: 'footerAddressLine3',
      title: 'Footer Address Line 3',
      type: 'string',
      initialValue: 'Kerala — 695 015',
    }),
    defineField({
      name: 'chapterCode',
      title: 'Chapter Code',
      type: 'string',
      initialValue: 'KE065',
    }),
    defineField({
      name: 'chapterLocation',
      title: 'Chapter Location',
      type: 'string',
      initialValue: 'MBCET · Kerala',
    }),
    defineField({
      name: 'contactEmail',
      title: 'Contact Email',
      type: 'string',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    
    // --- SECTION CUSTOMIZATION ---

    // Active Events Section
    defineField({
      name: 'activeEventsTag',
      title: 'Active Events Tag',
      type: 'string',
      initialValue: 'Live Now',
    }),
    defineField({
      name: 'activeEventsTitle',
      title: 'Active Events Title',
      description: 'Use <em> for italic accent. e.g. "Active <em>Events</em>"',
      type: 'string',
      initialValue: 'Active <em>Events</em>',
    }),
    defineField({
      name: 'noActiveEventsTitle',
      title: 'No Active Events Title',
      type: 'string',
      initialValue: 'The silence before the storm.',
    }),
    defineField({
      name: 'noActiveEventsBody',
      title: 'No Active Events Body',
      type: 'text',
      initialValue: 'Our team is currently architecting the next generation of technical experiences. The grid is quiet, but something big is coming.',
    }),

    // About Section
    defineField({
      name: 'aboutTag',
      title: 'About Tag',
      type: 'string',
      initialValue: 'About Us',
    }),

    // Who Are We Section
    defineField({
      name: 'whoTag',
      title: 'Who Are We Tag',
      type: 'string',
      initialValue: 'Who Are We',
    }),
    defineField({
      name: 'whoTitle',
      title: 'Who Are We Title',
      description: 'Use <em> for italic accent. e.g. "Built on Three<br /><em>Core Pillars</em>"',
      type: 'string',
      initialValue: 'Built on Three<br /><em>Core Pillars</em>',
    }),

    // Benefits Section
    defineField({
      name: 'benefitsTag',
      title: 'Benefits Tag',
      type: 'string',
      initialValue: 'Member Benefits',
    }),
    defineField({
      name: 'benefitsTitle',
      title: 'Benefits Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'Why Join<br /><em>ISTE MBCET?</em>',
    }),

    // Execom Section
    defineField({
      name: 'execomTag',
      title: 'Execom Tag',
      type: 'string',
      initialValue: 'Leadership 2026-27',
    }),
    defineField({
      name: 'execomTitle',
      title: 'Execom Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'Executive<br /><em>Committee</em>',
    }),
    defineField({
      name: 'execomFacultyLabel',
      title: 'Execom Faculty Advisors Label',
      type: 'string',
      initialValue: 'Faculty Advisors',
    }),
    defineField({
      name: 'execomMentorsLabel',
      title: 'Execom Student Mentors Label',
      type: 'string',
      initialValue: 'Student Mentors',
    }),
    defineField({
      name: 'execomCoreLabel',
      title: 'Execom Core Officers Label',
      type: 'string',
      initialValue: 'Core Officers',
    }),
    defineField({
      name: 'execomTeamLeadsLabel',
      title: 'Execom Team Leads Label',
      type: 'string',
      initialValue: 'Team Leads',
    }),
    defineField({
      name: 'execomJuniorLabel',
      title: 'Execom Junior Label',
      type: 'string',
      initialValue: 'Junior ExeCom',
    }),

    // Events Section
    defineField({
      name: 'eventsTag',
      title: 'Events Tag',
      type: 'string',
      initialValue: 'Events',
    }),
    defineField({
      name: 'eventsTitle',
      title: 'Events Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'Recent &amp;<br /><em>Upcoming</em>',
    }),

    // Membership Section
    defineField({
      name: 'membershipTag',
      title: 'Membership Tag',
      type: 'string',
      initialValue: 'Enroll Now',
    }),
    defineField({
      name: 'membershipTitle',
      title: 'Membership Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'Grab Your<br /><em>Membership</em>',
    }),
    defineField({
      name: 'membershipBody',
      title: 'Membership Body Text',
      type: 'text',
      initialValue: "Becoming a member of ISTE MBCET Student Chapter is your gateway to technical excellence, peer networking, and real-world professional growth. Fill in your details and we'll get you enrolled within 48 hours.",
    }),

    // Testimonials Section
    defineField({
      name: 'testimonialsTag',
      title: 'Testimonials Tag',
      type: 'string',
      initialValue: 'Member Voices',
    }),
    defineField({
      name: 'testimonialsTitle',
      title: 'Testimonials Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'What Our<br /><em>Members Say</em>',
    }),

    // Launchpad Section
    defineField({
      name: 'launchpadTag',
      title: 'Launchpad Tag',
      type: 'string',
      initialValue: 'Member Resources',
    }),
    defineField({
      name: 'launchpadTitle',
      title: 'Launchpad Title',
      description: 'Use <em> for italic accent.',
      type: 'string',
      initialValue: 'Internship<br /><em>Launchpad</em>',
    }),
    defineField({
      name: 'launchpadBody',
      title: 'Launchpad Body Text',
      type: 'text',
      initialValue: 'Curated internship opportunities, verified and posted by the ISTE MBCET team — exclusively for our members.',
    }),
    defineField({
      name: 'launchpadExperimentalLabel',
      title: 'Launchpad Experimental Badge Label',
      description: 'The text on the yellow "Under Construction" badge on the homepage. Clear this field to hide the badge.',
      type: 'string',
      initialValue: 'Experimental • Under Construction',
    }),

  ],
  preview: {
    select: { title: 'chapterCode' },
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
