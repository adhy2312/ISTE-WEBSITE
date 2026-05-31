import { defineField, defineType } from 'sanity'

export const activeEventSchema = defineType({
  name: 'activeEvent',
  title: 'Active Event',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Event Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug (Optional)',
      type: 'slug',
      description: 'If this links to an internal event page, provide the slug matching the full event.',
      options: {
        source: 'title',
        maxLength: 96,
      }
    }),
    defineField({
      name: 'dateLabel',
      title: 'Date Label',
      description: 'e.g. "MAR 2026" — shown on the website',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'eventType',
      title: 'Event Type',
      description: 'e.g. "IEEE Collab", "24-Hour Hackathon"',
      type: 'string',
    }),
    defineField({
      name: 'isCurrentlyHappening',
      title: 'Is Currently Happening? (Live Event Heartbeat)',
      description: 'Turn this on if the event is actively taking place RIGHT NOW. It will pulse red on the website.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'link',
      title: 'External Link (Optional)',
      description: 'If you want to link out to a registration form instead of an internal page',
      type: 'url',
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
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'dateLabel',
    },
  },
})
