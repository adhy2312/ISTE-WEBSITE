import { defineField, defineType } from 'sanity'

export const memberProjectSchema = defineType({
  name: 'memberProject',
  title: 'Member Project Showcase',
  type: 'document',
  fields: [
    defineField({
      name: 'memberName',
      title: 'Member Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'memberRole',
      title: 'Member Role / Batch',
      description: 'e.g. "3rd Year CSE" or "Alumni 2024"',
      type: 'string',
    }),
    defineField({
      name: 'memberPhoto',
      title: 'Member Photo (optional)',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'repoName',
      title: 'Project / Repository Name',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'description',
      title: 'Project Description',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.max(280),
    }),
    defineField({
      name: 'githubUrl',
      title: 'GitHub Repository URL',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }).required(),
    }),
    defineField({
      name: 'liveUrl',
      title: 'Live Demo URL (optional)',
      type: 'url',
      validation: (Rule) => Rule.uri({ scheme: ['https'] }),
    }),
    defineField({
      name: 'coverImage',
      title: 'Project Cover Image',
      type: 'image',
      options: { hotspot: true },
    }),
    defineField({
      name: 'techTags',
      title: 'Tech Stack Tags',
      description: 'e.g. ["React", "Python", "PostgreSQL"]',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'stars',
      title: 'GitHub Stars (manual)',
      description: 'Update periodically via the GitHub Sync API',
      type: 'number',
      initialValue: 0,
    }),
    defineField({
      name: 'featured',
      title: 'Featured Project?',
      description: 'Featured projects appear first and larger in the grid.',
      type: 'boolean',
      initialValue: false,
    }),
    defineField({
      name: 'order',
      title: 'Display Order',
      type: 'number',
      description: 'Lower number = shown first within same feature level',
    }),
  ],
  orderings: [
    {
      title: 'Featured First, then Stars',
      name: 'featuredDesc',
      by: [
        { field: 'featured', direction: 'desc' },
        { field: 'stars', direction: 'desc' },
      ],
    },
  ],
  preview: {
    select: {
      title: 'repoName',
      subtitle: 'memberName',
      media: 'coverImage',
    },
  },
})
