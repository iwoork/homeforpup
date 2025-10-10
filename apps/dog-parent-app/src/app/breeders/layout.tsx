import { Metadata } from 'next';
import { generateMetadata as createMetadata } from '@/lib/utils/seo';

export const metadata: Metadata = createMetadata({
  title: 'Find Trusted Dog Breeders | HomeForPup',
  description: 'Connect with verified, caring dog breeders who prioritize health, temperament, and responsible breeding practices. Find your perfect puppy from ethical breeders.',
  keywords: [
    'dog breeders',
    'ethical breeders',
    'verified breeders',
    'puppy breeders',
    'responsible breeding',
    'dog families',
    'puppy adoption',
    'breeder directory',
    'trusted breeders',
    'health tested puppies'
  ],
  url: '/breeders',
  type: 'website',
});

export default function BreedersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
