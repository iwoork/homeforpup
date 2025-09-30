import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeforpup.com'

// Static routes for the adopter app
const staticRoutes = [
  {
    url: `${baseUrl}/`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: `${baseUrl}/browse`,
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  },
  {
    url: `${baseUrl}/breeds`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/breeders`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/users`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/about`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/adoption-guide`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/breeder-resources`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/accessibility`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.4,
  },
  {
    url: `${baseUrl}/contact`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/cookies`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: `${baseUrl}/dashboard`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: `${baseUrl}/dashboard/activity`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/dashboard/favorites`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/dashboard/messages`,
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: `${baseUrl}/ethical-guidelines`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/faq`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/kennel-management`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: `${baseUrl}/privacy`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: `${baseUrl}/terms`,
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: `${baseUrl}/auth/login`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: `${baseUrl}/auth/error`,
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  },
]

// Function to fetch dynamic routes (breeders, users, kennels)
async function fetchDynamicRoutes() {
  try {
    // For now, return empty array since we don't have API endpoints in adopter-app
    // In a real implementation, you would fetch from your API
    return []
  } catch (error) {
    console.error('Error fetching dynamic routes:', error)
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const dynamicRoutes = await fetchDynamicRoutes()
  
  return [...staticRoutes, ...dynamicRoutes]
}
