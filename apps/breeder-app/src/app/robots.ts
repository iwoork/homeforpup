import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://breeder.homeforpup.com'
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/api/',
        '/dashboard/',
        '/auth/',
        '/kennels/[id]/edit',
        '/kennels/[id]',
        '/dogs/[id]/edit',
        '/dogs/[id]',
        '/litters/[id]/edit',
        '/litters/[id]',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}
