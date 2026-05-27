import { defineField, defineType } from 'sanity'

export const siteSettingsSchema = defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  // Singleton — only one document of this type
  __experimental_actions: ['update', 'publish'],
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
  ],
  preview: {
    select: { title: 'chapterCode' },
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
