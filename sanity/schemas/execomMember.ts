import { defineField, defineType } from 'sanity'

export const execomMemberSchema = defineType({
  name: 'execomMember',
  title: 'ExeCom Member',
  type: 'document',
  fields: [
    defineField({
      name: 'name',
      title: 'Full Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'initials',
      title: 'Initials',
      description: 'Shown in the avatar circle (e.g. "AR")',
      type: 'string',
      validation: (Rule) => Rule.required().max(3),
    }),
    defineField({
      name: 'role',
      title: 'Role',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Team / Category',
      type: 'string',
      options: {
        list: [
          { title: 'Faculty Advisor', value: 'faculty' },
          { title: 'Student Mentor', value: 'mentor' },
          { title: 'Core Team', value: 'core' },
          { title: 'PR and Media Team', value: 'pr_media' },
          { title: 'Design Team', value: 'design' },
          { title: 'Content and Documentation Team', value: 'content_doc' },
          { title: 'Event Management Team', value: 'event_management' },
          { title: 'SHE Team', value: 'she' },
          { title: 'Internship Launchpad Team', value: 'internship_launchpad' },
          { title: 'Junior ExeCom', value: 'junior' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'photo',
      title: 'Photo (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
    }),
    defineField({
      name: 'linkedinUrl',
      title: 'LinkedIn URL',
      type: 'url',
    }),
    defineField({
      name: 'instagramUrl',
      title: 'Instagram URL',
      type: 'url',
    }),
    defineField({
      name: 'subMembers',
      title: 'Sub-Members (for Team Heads only)',
      type: 'array',
      of: [
        {
          type: 'object',
          name: 'subMember',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'initials', title: 'Initials', type: 'string' }),
            defineField({
              name: 'photo',
              title: 'Photo (optional)',
              type: 'image',
              options: { hotspot: true },
            }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'initials', media: 'photo' },
          },
        },
      ],
    }),
  ],
  preview: {
    select: {
      title: 'name',
      subtitle: 'role',
      media: 'photo',
    },
  },
})
