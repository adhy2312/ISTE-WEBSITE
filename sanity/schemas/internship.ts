import { defineField, defineType } from 'sanity'

export const internshipSchema = defineType({
  name: 'internship',
  title: 'Internship',
  type: 'document',
  fields: [
    defineField({
      name: 'company',
      title: 'Company Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'role',
      title: 'Role / Position',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Internship Type',
      type: 'string',
      options: {
        list: [
          { title: 'Remote', value: 'Remote' },
          { title: 'On-site', value: 'On-site' },
          { title: 'Hybrid', value: 'Hybrid' },
        ],
        layout: 'radio',
      },
      initialValue: 'Remote',
    }),
    defineField({
      name: 'domain',
      title: 'Domain / Field',
      description: 'e.g. "Software Engineering", "UI/UX Design", "Data Science"',
      type: 'string',
    }),
    defineField({
      name: 'stipend',
      title: 'Stipend',
      description: 'e.g. "₹15,000/month" or "Unpaid"',
      type: 'string',
    }),
    defineField({
      name: 'duration',
      title: 'Duration',
      description: 'e.g. "2 months", "6 weeks"',
      type: 'string',
    }),
    defineField({
      name: 'deadline',
      title: 'Application Deadline',
      type: 'date',
    }),
    defineField({
      name: 'deadlineLabel',
      title: 'Deadline Label',
      description: 'Human-readable, e.g. "May 15, 2026"',
      type: 'string',
    }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'text',
      rows: 4,
    }),
    defineField({
      name: 'applyLink',
      title: 'Apply Link (URL)',
      type: 'url',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'logo',
      title: 'Company Logo',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'Open', value: 'open' },
          { title: 'Closed', value: 'closed' },
          { title: 'Coming Soon', value: 'coming_soon' },
        ],
        layout: 'radio',
      },
      initialValue: 'open',
    }),
    defineField({
      name: 'featured',
      title: 'Featured?',
      description: 'Featured internships appear highlighted on the homepage teaser.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = shown first',
    }),
  ],
  orderings: [
    {
      title: 'Display Order',
      name: 'orderAsc',
      by: [{ field: 'order', direction: 'asc' }],
    },
    {
      title: 'Deadline (Soonest First)',
      name: 'deadlineAsc',
      by: [{ field: 'deadline', direction: 'asc' }],
    },
  ],
  preview: {
    select: {
      title: 'role',
      subtitle: 'company',
      media: 'logo',
    },
  },
})
