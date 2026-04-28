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
      photo {
        asset->,
        hotspot,
        crop,
      },
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
    heroHeadline,
    heroDescription,
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

export const internshipsQuery = groq`
  *[_type == "internship"] | order(order asc, deadline asc) {
    _id,
    company,
    role,
    type,
    domain,
    stipend,
    duration,
    deadline,
    deadlineLabel,
    description,
    applyLink,
    status,
    featured,
    order,
    logo {
      asset->,
      hotspot,
      crop,
    },
  }
`

export const featuredInternshipsQuery = groq`
  *[_type == "internship" && featured == true && status == "open"] | order(order asc) [0...3] {
    _id,
    company,
    role,
    type,
    domain,
    stipend,
    duration,
    deadlineLabel,
    applyLink,
    status,
  }
`

export const homePageQuery = groq`
  {
    "events": ${eventsQuery},
    "execomMembers": ${execomMembersQuery},
    "stats": ${statsQuery},
    "testimonials": ${testimonialsQuery},
    "settings": ${siteSettingsQuery},
    "featuredInternships": ${featuredInternshipsQuery},
  }
`
