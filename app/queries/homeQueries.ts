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
      asset->{..., metadata { lqip }},
      hotspot,
      crop,
    },
    linkedinUrl,
    instagramUrl,
    subMembers[] {
      name,
      initials,
      photo {
        asset->{..., metadata { lqip }},
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

export const faqsQuery = groq`
  *[_type == "faq"] | order(order asc) {
    _id,
    question,
    answer,
    category,
    order,
  }
`

export const siteSettingsQuery = groq`
  *[_type == "siteSettings"][0]
`

export const internshipsQuery = groq`
  *[
    _type == "internship" &&
    status == "open"
  ] | order(featured desc, qualityScore desc, _createdAt desc) {
    _id,
    _createdAt,
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
    state,
    verificationStatus,
    linkHealthScore,
    qualityScore,
    qualityTier,
    featured,
    hubCategory,
    districtLocation,
    aiRecommendation,
    order,
    logo {
      asset->{..., metadata { lqip }},
      hotspot,
      crop,
    },
  }
`

export const featuredInternshipsQuery = groq`
  *[
    _type == "internship" &&
    verificationStatus == "VERIFIED" &&
    linkHealthScore > 40
  ] | order(featured desc, qualityScore desc, _createdAt desc) [0...4] {
    _id,
    company,
    role,
    type,
    domain,
    stipend,
    duration,
    deadlineLabel,
    applyLink,
    qualityScore,
    qualityTier,
    status,
    verificationStatus,
    linkHealthScore,
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

export const activeEventsQuery = groq`
  *[_type == "activeEvent"] | order(order asc) {
    _id,
    title,
    "slug": slug.current,
    dateLabel,
    eventType,
    isCurrentlyHappening,
    link,
    order
  }
`

export const homePageBuilderQuery = groq`
  *[_type == "homePage"][0]
`

export const navigationMenuQuery = groq`
  *[_type == "navigationMenu"][0]
`


export const homePageQuery = groq`
  {
    "homePage": ${homePageBuilderQuery},
    "navigationMenu": ${navigationMenuQuery},
    "activeEvents": ${activeEventsQuery},
    "events": ${eventsQuery},
    "execomMembers": ${execomMembersQuery},
    "stats": ${statsQuery},
    "settings": ${siteSettingsQuery},
    "featuredInternships": ${featuredInternshipsQuery},
    "pillars": ${pillarsQuery},
    "benefits": ${benefitsQuery},
    "faqs": ${faqsQuery},
  }
`
