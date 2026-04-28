import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './sanity/schemas'

export default defineConfig({
  name: 'iste-mbcet',
  title: 'ISTE MBCET',
  basePath: '/studio',

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID!,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET!,

  plugins: [
    structureTool({
      structure: (S) =>
        S.list()
          .title('Content')
          .items([
            // Singleton: Site Settings
            S.listItem()
              .title('Site Settings')
              .id('siteSettings')
              .child(
                S.document()
                  .schemaType('siteSettings')
                  .documentId('siteSettings')
              ),
            S.divider(),
            // Regular document types
            S.documentTypeListItem('event').title('Events'),
            S.documentTypeListItem('execomMember').title('ExeCom Members'),
            S.documentTypeListItem('stat').title('Stats'),
            S.documentTypeListItem('testimonial').title('Testimonials'),
            S.divider(),
            S.documentTypeListItem('internship').title('Internship Launchpad'),
          ]),
    }),
    visionTool(), // GROQ query tester — dev only
  ],

  schema: {
    types: schemaTypes,
  },
})
