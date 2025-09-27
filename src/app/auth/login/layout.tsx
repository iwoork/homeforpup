import { Metadata } from 'next';
import { generateMetadata as createMetadata, PAGE_METADATA } from '@/lib/utils/seo';

export const metadata: Metadata = createMetadata(PAGE_METADATA.login);

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
