import { defineField, defineType } from 'sanity'

export const announcementSchema = defineType({
  name: 'announcement',
  title: 'Active Announcements / Alerts',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Announcement Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'message',
      title: 'Message',
      description: 'Keep it short and punchy.',
      type: 'text',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'type',
      title: 'Alert Type',
      type: 'string',
      options: {
        list: [
          { title: 'Urgent / Alert (Red)', value: 'urgent' },
          { title: 'New Feature / Launch (Blue)', value: 'feature' },
          { title: 'Event Reminder (Yellow)', value: 'reminder' },
        ],
        layout: 'radio',
      },
      initialValue: 'reminder',
    }),
    defineField({
      name: 'isActive',
      title: 'Is Active?',
      description: 'Toggle this on to immediately broadcast it across the website.',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showInNavbar',
      title: 'Show as Navbar Banner?',
      type: 'boolean',
      initialValue: true,
    }),
    defineField({
      name: 'showAsPopup',
      title: 'Show as Entrance Popup?',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'ctaLabel',
      title: 'Action Button Label',
      description: 'e.g. "Register Now"',
      type: 'string',
    }),
    defineField({
      name: 'link',
      title: 'Action Link (Optional)',
      description: 'Where should clicking the announcement take them?',
      type: 'url',
    }),
    defineField({
      name: 'expiresAt',
      title: 'Expiry Date',
      description: 'Auto-hide this announcement after a specific date',
      type: 'datetime',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'type',
      isActive: 'isActive',
    },
    prepare(selection) {
      const { title, subtitle, isActive } = selection
      return {
        title: `${isActive ? '🟢 [LIVE] ' : '🔴 [OFF] '} ${title}`,
        subtitle: `Type: ${subtitle}`
      }
    }
  }
})
