import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeforpup.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/auth/',
        '/users/[id]/edit',
        '/kennels/[id]',
        '/users/[id]',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}