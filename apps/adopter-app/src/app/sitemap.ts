import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeforpup.com'

// Static routes for the adopter app
const staticRoutes = [
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: '/browse',
    lastModified: new Date(),
    changeFrequency: 'hourly' as const,
    priority: 0.9,
  },
  {
    url: '/breeds',
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  },
  {
    url: '/breeders',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: '/users',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.7,
  },
  {
    url: '/about',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/adoption-guide',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/faq',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/privacy',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
  },
  {
    url: '/terms',
    lastModified: new Date(),
    changeFrequency: 'yearly' as const,
    priority: 0.3,
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
