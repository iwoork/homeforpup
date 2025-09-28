import { Metadata } from 'next'
import { generateMetadata as generateSEOMetadata, PAGE_METADATA } from '@/lib/utils/seo'

export const metadata: Metadata = generateSEOMetadata(PAGE_METADATA.browse)

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}