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
      name: 'aboutTitle',
      title: 'About Section Title',
      type: 'string',
    }),
    defineField({
      name: 'aboutBody',
      title: 'About Body Paragraphs',
      type: 'array',
      of: [{ type: 'text' }],
    }),
    defineField({
      name: 'chapterCode',
      title: 'Chapter Code',
      type: 'string',
      initialValue: 'KE065',
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
