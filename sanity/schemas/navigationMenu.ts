import { defineField, defineType } from 'sanity'

export const navigationMenuSchema = defineType({
  name: 'navigationMenu',
  title: 'Navigation Menu',
  type: 'document',
  fields: [
    defineField({
      name: 'mainLinks',
      title: 'Main Navigation Links',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'navLink',
          fields: [
            defineField({
              name: 'label',
              title: 'Label',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'href',
              title: 'URL / Anchor',
              description: 'e.g. "#about", "/internships"',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'isHighlighted',
              title: 'Is Highlighted?',
              description: 'Makes this link stand out in the nav (e.g. Launchpad ✦)',
              type: 'boolean',
              initialValue: false,
            }),
            defineField({
              name: 'highlightSuffix',
              title: 'Highlight Suffix (optional)',
              description: 'e.g. "✦"',
              type: 'string',
              hidden: ({ parent }) => !parent?.isHighlighted,
            }),
          ],
          preview: {
            select: { title: 'label', subtitle: 'href', isHighlighted: 'isHighlighted' },
            prepare({ title, subtitle, isHighlighted }) {
              return {
                title: `${title} ${isHighlighted ? '✨' : ''}`,
                subtitle: subtitle,
              }
            },
          },
        },
      ],
    }),
    defineField({
      name: 'ctaLabel',
      title: 'CTA Button Label',
      description: 'e.g. "Join Now"',
      type: 'string',
      initialValue: 'Join Now',
    }),
    defineField({
      name: 'ctaHref',
      title: 'CTA Button URL / Anchor',
      description: 'e.g. "#membership"',
      type: 'string',
      initialValue: '#membership',
    }),
    defineField({
      name: 'footerColumns',
      title: 'Footer Columns',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'column',
          fields: [
            defineField({
              name: 'title',
              title: 'Column Title',
              type: 'string',
              validation: (Rule) => Rule.required(),
            }),
            defineField({
              name: 'links',
              title: 'Links',
              type: 'array',
              of: [
                {
                  type: 'object',
                  name: 'link',
                  fields: [
                    defineField({ name: 'label', title: 'Label', type: 'string' }),
                    defineField({ name: 'href', title: 'URL', type: 'string' }),
                  ],
                },
              ],
            }),
          ],
        },
      ],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Global Navigation' }
    },
  },
})
