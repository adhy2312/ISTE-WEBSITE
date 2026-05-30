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
      name: 'requiredSkills',
      title: 'Required Skills',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'preferredSkills',
      title: 'Preferred Skills',
      type: 'array',
      of: [{ type: 'string' }],
    }),
    defineField({
      name: 'bonusSkills',
      title: 'Bonus Skills',
      type: 'array',
      of: [{ type: 'string' }],
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
      name: 'state',
      title: 'State Machine Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'NEW' },
          { title: 'Active', value: 'ACTIVE' },
          { title: 'Verified', value: 'VERIFIED' },
          { title: 'Suspect', value: 'SUSPECT' },
          { title: 'Expired', value: 'EXPIRED' },
          { title: 'Archived', value: 'ARCHIVED' },
          { title: 'Deleted', value: 'DELETED' },
        ],
        layout: 'radio',
      },
      initialValue: 'NEW',
    }),
    defineField({
      name: 'verificationStatus',
      title: 'Verification Status',
      type: 'string',
      initialValue: 'UNVERIFIED',
    }),
    defineField({
      name: 'lastVerifiedAt',
      title: 'Last Verified At',
      type: 'datetime',
    }),
    defineField({
      name: 'linkHealthScore',
      title: 'Link Health Score',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
    }),
    defineField({
      name: 'confidenceScore',
      title: 'AI Confidence Score',
      type: 'number',
    }),
    defineField({
      name: 'qualityScore',
      title: 'Final Quality Score',
      type: 'number',
    }),
    defineField({
      name: 'verificationFailures',
      title: 'Consecutive Verification Failures',
      type: 'number',
      initialValue: 0,
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
