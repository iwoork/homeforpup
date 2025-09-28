import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata } from '@/lib/utils/seo'

export const metadata: Metadata = generateSEOMetadata({
  title: 'FAQ - Frequently Asked Questions',
  description: 'Find answers to common questions about finding, adopting, and caring for your new puppy. Get help with HomeForPup platform, breeder verification, and puppy adoption process.',
  keywords: ['puppy faq', 'adoption questions', 'breeder help', 'puppy care', 'homeforpup help'],
  url: '/faq'
})

export default function FAQLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
