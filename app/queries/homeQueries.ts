import { groq } from 'next-sanity'

export const eventsQuery = groq`
  *[_type == "event"] | order(order asc, date desc) {
    _id,
    title,
    "slug": slug.current,
    dateLabel,
    date,
    eventType,
    status,
    isCurrentlyHappening,
    link,
    order,
    "galleryTeaser": gallery[0...3]
  }
`

export const eventBySlugQuery = groq`
  *[_type == "event" && slug.current == $slug][0] {
    _id,
    title,
    "slug": slug.current,
    dateLabel,
    date,
    eventType,
    status,
    isCurrentlyHappening,
    link,
    registrationLink,
    description,
    fullReport,
    gallery
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
    linkedinUrl,
    instagramUrl,
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
    photo {
      asset->,
      hotspot,
      crop,
    },
    order,
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0] {
    heroHeadline,
    heroDescription,
    heroSubtitle,
    heroTypedText,
    heroPrimaryCtaLabel,
    heroSecondaryCtaLabel,
    tickerItems,
    aboutTitle,
    aboutBody,
    membershipPerks,
    navCtaLabel,
    footerTagline,
    chapterCode,
    chapterLocation,
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

export const pillarsQuery = groq`
  *[_type == "pillar"] | order(order asc) {
    _id,
    number,
    title,
    body,
  }
`

export const benefitsQuery = groq`
  *[_type == "benefit"] | order(order asc) {
    _id,
    icon,
    title,
    body,
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
    "pillars": ${pillarsQuery},
    "benefits": ${benefitsQuery},
  }
`
