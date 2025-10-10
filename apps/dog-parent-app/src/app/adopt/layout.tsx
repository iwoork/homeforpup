import type { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'Adopt from Canadian Shelters & Rescues - HomeForPup',
  description: 'Find animal shelters and rescue organizations across Canada. Connect with local rescues to adopt dogs, cats, and other pets from trusted organizations.',
  keywords: [
    'adopt dogs canada',
    'animal shelters canada',
    'rescue organizations canada',
    'humane society canada',
    'spca canada',
    'adopt pets canada',
    'animal rescue canada',
    'dog adoption canada',
    'cat adoption canada',
    'pet adoption canada',
    'canadian animal shelters',
    'canadian rescue organizations'
  ],
  url: '/adopt',
  type: 'website'
})

export default function AdoptLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
