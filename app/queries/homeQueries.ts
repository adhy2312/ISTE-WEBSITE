import { groq } from 'next-sanity'

export const eventsQuery = groq`
  *[_type == "event"] | order(order asc, date desc) {
    _id,
    title,
    dateLabel,
    date,
    eventType,
    status,
    link,
    order,
  }
`

export const execomMembersQuery = groq`
  *[_type == "execomMember"] | order(order asc) {
    _id,
    name,
    initials,
    role,
    category,
    team,
    order,
    photo {
      asset->,
      hotspot,
      crop,
    },
    subMembers[] {
      name,
      initials,
    }
  }
`

export const statsQuery = groq`
  *[_type == "stat"] | order(order asc) {
    _id,
    label,
    value,
    suffix,
    order,
  }
`

export const testimonialsQuery = groq`
  *[_type == "testimonial"] | order(order asc) {
    _id,
    quote,
    authorName,
    authorRole,
    avatarSeed,
    order,
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroSubtitle,
    heroTypedText,
    aboutTitle,
    aboutBody,
    chapterCode,
    contactEmail,
    instagramUrl,
    linkedinUrl,
  }
`

export const homePageQuery = groq`
  {
    "events": ${eventsQuery},
    "execomMembers": ${execomMembersQuery},
    "stats": ${statsQuery},
    "testimonials": ${testimonialsQuery},
    "settings": ${siteSettingsQuery},
  }
`
