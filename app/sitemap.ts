import { MetadataRoute } from 'next'
import { getClient } from '@/lib/sanity/client'
import { groq } from 'next-sanity'

const BASE_URL = 'https://iste-mbcet.vercel.app'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Fetch event slugs from Sanity
  const events = await getClient().fetch<{ slug: string; _updatedAt: string }[]>(
    groq`*[_type == "event" && defined(slug.current)] { "slug": slug.current, _updatedAt }`
  )

  const eventEntries: MetadataRoute.Sitemap = events.map((event) => ({
    url: `${BASE_URL}/events/${event.slug}`,
    lastModified: event._updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/internships`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.8,
    },
  ]

  return [...staticEntries, ...eventEntries]
}
