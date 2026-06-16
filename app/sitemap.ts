import { MetadataRoute } from 'next'
import { getClient } from '@/lib/sanity/client'
import { groq } from 'next-sanity'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://iste-mbcet.vercel.app'
  
  // Fetch dynamic slugs for events
  const eventsQuery = groq`*[_type == "event"]{ "slug": slug.current, _updatedAt }`
  let events: any[] = []
  try {
    events = await getClient().fetch(eventsQuery)
  } catch (error) {
    console.error("Failed to fetch events for sitemap", error)
  }

  const eventUrls: MetadataRoute.Sitemap = events
    .filter((event) => event.slug)
    .map((event) => ({
      url: `${baseUrl}/events/${event.slug}`,
      lastModified: new Date(event._updatedAt || new Date()),
      changeFrequency: 'monthly',
      priority: 0.8,
    }))
  
  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${baseUrl}/internships`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...eventUrls
  ]
}
