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
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: 'Faculty Advisor', value: 'faculty' },
          { title: 'Student Mentor', value: 'mentor' },
          { title: 'Core Officer', value: 'core' },
          { title: 'Team Lead', value: 'teamLead' },
          { title: 'Junior ExeCom', value: 'junior' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'team',
      title: 'Team (for Team Leads & Junior ExeCom)',
      description: 'e.g. "Event Management Team"',
      type: 'string',
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
      name: 'subMembers',
      title: 'Sub-Members (for Team Leads only)',
      type: 'array',
      of: [
        {
          type: 'object',
          fields: [
            defineField({ name: 'name', title: 'Name', type: 'string' }),
            defineField({ name: 'initials', title: 'Initials', type: 'string' }),
          ],
          preview: {
            select: { title: 'name', subtitle: 'initials' },
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
