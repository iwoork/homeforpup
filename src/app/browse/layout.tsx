import { Metadata } from 'next';
import { generateMetadata as createMetadata, PAGE_METADATA } from '@/lib/utils/seo';

export const metadata: Metadata = createMetadata(PAGE_METADATA.browse);

export default function BrowseLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
