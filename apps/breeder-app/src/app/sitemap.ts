import { MetadataRoute } from 'next'

const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://breeder.homeforpup.com'

// Static routes for the breeder app
const staticRoutes = [
  {
    url: '/',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 1.0,
  },
  {
    url: '/dashboard',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/dashboard/activity',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: '/dashboard/messages',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.8,
  },
  {
    url: '/kennels',
    lastModified: new Date(),
    changeFrequency: 'daily' as const,
    priority: 0.9,
  },
  {
    url: '/kennels/new',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/docs',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  },
  {
    url: '/docs/quick-start',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/docs/complete-guide',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/docs/visual-guide',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  },
  {
    url: '/docs/faq',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  },
  {
    url: '/auth/login',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  },
  {
    url: '/auth/error',
    lastModified: new Date(),
    changeFrequency: 'monthly' as const,
    priority: 0.4,
  },
]

// Function to fetch dynamic routes (kennels, dogs, litters)
async function fetchDynamicRoutes() {
  try {
    // For now, return empty array since we don't have API endpoints in breeder-app
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
