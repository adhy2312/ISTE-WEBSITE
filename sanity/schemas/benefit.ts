import { defineField, defineType } from 'sanity'

export const benefitSchema = defineType({
  name: 'benefit',
  title: 'Benefit',
  type: 'document',
  fields: [
    defineField({
      name: 'icon',
      title: 'Icon Name (Lucide)',
      type: 'string',
      description: 'e.g. "Zap", "Trophy", "Globe", "FileText", "GraduationCap", "Users"',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'imageIcon',
      title: 'Custom Icon Image (optional)',
      description: 'Overrides the Lucide icon above if provided',
      type: 'image',
    }),
    defineField({
      name: 'accentColor',
      title: 'Accent Color (Hex)',
      description: 'Optional custom glow color for this benefit card',
      type: 'string',
    }),
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Body Text',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'icon',
    },
  },
})
