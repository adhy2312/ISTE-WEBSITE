import { defineField, defineType } from 'sanity'

export const homePageSchema = defineType({
  name: 'homePage',
  title: 'Home Page Builder',
  type: 'document',
  fields: [
    defineField({
      name: 'sections',
      title: 'Homepage Sections',
      description: 'Drag and drop to reorder sections. Toggle visibility using the switch inside each item.',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'section',
          fields: [
            defineField({
              name: 'sectionId',
              title: 'Section Component',
              type: 'string',
              options: {
                list: [
                  { title: 'Hero Section', value: 'hero' },
                  { title: 'Active Events (Live)', value: 'activeEvents' },
                  { title: 'About Us', value: 'about' },
                  { title: 'Who Are We (Pillars)', value: 'who' },
                  { title: 'Statistics', value: 'stats' },
                  { title: 'Benefits', value: 'benefits' },
                  { title: 'Executive Committee', value: 'execom' },
                  { title: 'Events List', value: 'events' },
                  { title: 'Membership Form', value: 'membership' },
                  { title: 'Internship Launchpad', value: 'launchpad' },
                  { title: 'FAQs', value: 'faq' },
                ],
              },
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'visible',
              title: 'Visible on Website?',
              type: 'boolean',
              initialValue: true,
            }),
          ],
          preview: {
            select: {
              title: 'sectionId',
              visible: 'visible',
            },
            prepare({ title, visible }) {
              const labels: Record<string, string> = {
                hero: 'Hero Section',
                activeEvents: 'Active Events (Live)',
                about: 'About Us',
                who: 'Who Are We (Pillars)',
                stats: 'Statistics',
                benefits: 'Benefits',
                execom: 'Executive Committee',
                events: 'Events List',
                membership: 'Membership Form',
                launchpad: 'Internship Launchpad',
                faq: 'FAQs',
              }
              return {
                title: labels[title as string] || title,
                subtitle: visible ? '🟢 Visible' : '🔴 Hidden',
              }
            },
          },
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Home Page Layout' }
    },
  },
})
