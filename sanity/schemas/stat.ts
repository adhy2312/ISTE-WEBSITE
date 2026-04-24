import { defineField, defineType } from 'sanity'

export const statSchema = defineType({
  name: 'stat',
  title: 'Stat',
  type: 'document',
  fields: [
    defineField({
      name: 'label',
      title: 'Label',
      description: 'e.g. "Active Members"',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'value',
      title: 'Value',
      type: 'number',
      validation: (Rule) => Rule.required().positive(),
    }),
    defineField({
      name: 'suffix',
      title: 'Suffix',
      description: '"+" or "%"',
      type: 'string',
      options: {
        list: [
          { title: '+', value: '+' },
          { title: '%', value: '%' },
        ],
      },
      initialValue: '+',
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
  ],
  preview: {
    select: {
      title: 'label',
      subtitle: 'value',
    },
  },
})
