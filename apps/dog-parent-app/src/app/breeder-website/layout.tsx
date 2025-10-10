import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Professional Breeder Websites - Custom .com Domains | HomeForPup',
  description: 'Create a stunning professional website for your kennel with custom .com domain. Seamlessly integrated with HomeForPup platform for puppy management, waitlists, and family communication.',
  keywords: [
    'breeder website',
    'kennel website',
    'custom domain',
    'professional breeder site',
    'puppy website',
    'dog breeder website',
    'kennel domain',
    'breeder online presence',
    'professional dog breeding website',
    'integrated breeder platform',
    'custom .com domain',
    'breeder marketing website',
    'puppy breeder website design',
    'kennel professional website'
  ],
  url: '/breeder-website',
  type: 'website'
})

export default function BreederWebsiteLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
