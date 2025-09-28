import { Metadata } from 'next';
import { generateMetadata as createMetadata, PAGE_METADATA } from '@/lib/utils/seo';

export const metadata: Metadata = createMetadata(PAGE_METADATA.users);

export default function UsersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
