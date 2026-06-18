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
            S.listItem()
              .title('Home Page Builder')
              .id('homePage')
              .child(
                S.document()
                  .schemaType('homePage')
                  .documentId('homePage')
              ),
            S.listItem()
              .title('Navigation Menu')
              .id('navigationMenu')
              .child(
                S.document()
                  .schemaType('navigationMenu')
                  .documentId('navigationMenu')
              ),

            S.divider(),
            // Regular document types
            S.documentTypeListItem('announcement').title('Announcements'),
            S.documentTypeListItem('activeEvent').title('Active Events'),
            S.documentTypeListItem('event').title('All Events'),
            S.listItem()
              .title('ExeCom Management')
              .child(
                S.list()
                  .title('ExeCom Teams')
                  .items([
                    S.listItem().title('Faculty Advisors').child(S.documentList().title('Faculty Advisors').filter('_type == "execomMember" && category == "faculty"')),
                    S.listItem().title('Mentors').child(S.documentList().title('Mentors').filter('_type == "execomMember" && category == "mentor"')),
                    S.listItem().title('Core Team').child(S.documentList().title('Core Team').filter('_type == "execomMember" && category == "core"')),
                    S.listItem().title('PR and Media Team').child(S.documentList().title('PR and Media Team').filter('_type == "execomMember" && category == "pr_media"')),
                    S.listItem().title('Design Team').child(S.documentList().title('Design Team').filter('_type == "execomMember" && category == "design"')),
                    S.listItem().title('Content and Documentation Team').child(S.documentList().title('Content and Documentation Team').filter('_type == "execomMember" && category == "content_doc"')),
                    S.listItem().title('Event Management Team').child(S.documentList().title('Event Management Team').filter('_type == "execomMember" && category == "event_management"')),
                    S.listItem().title('SHE Team').child(S.documentList().title('SHE Team').filter('_type == "execomMember" && category == "she"')),
                    S.listItem().title('Internship Launchpad Team').child(S.documentList().title('Internship Launchpad Team').filter('_type == "execomMember" && category == "internship_launchpad"')),
                    S.listItem().title('Junior ExeCom').child(S.documentList().title('Junior ExeCom').filter('_type == "execomMember" && category == "junior"')),
                  ])
              ),
            S.documentTypeListItem('pillar').title('Who We Are (Pillars)'),
            S.documentTypeListItem('benefit').title('Member Benefits'),
            S.documentTypeListItem('stat').title('Stats'),
            S.documentTypeListItem('faq').title('FAQs'),

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
