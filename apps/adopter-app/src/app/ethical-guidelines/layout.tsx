import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ethical Guidelines for Pet Adoption | HomeForPup',
  description: 'Learn about responsible pet adoption and ethical breeding practices. Our comprehensive guidelines help ensure animal welfare and responsible pet ownership.',
  keywords: [
    'pet adoption guidelines',
    'ethical breeding practices',
    'responsible pet ownership',
    'animal welfare',
    'dog adoption ethics',
    'puppy adoption guidelines',
    'breeder standards',
    'pet care guidelines'
  ],
  openGraph: {
    title: 'Ethical Guidelines for Pet Adoption | HomeForPup',
    description: 'Our commitment to responsible pet adoption and ethical breeding practices. Guidelines for adopters and breeders to ensure animal welfare.',
    type: 'website',
    url: 'https://homeforpup.com/ethical-guidelines',
    images: [
      {
        url: 'https://homeforpup.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'HomeForPup Ethical Guidelines'
      }
    ]
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Ethical Guidelines for Pet Adoption | HomeForPup',
    description: 'Our commitment to responsible pet adoption and ethical breeding practices. Guidelines for adopters and breeders to ensure animal welfare.',
    images: ['https://homeforpup.com/logo.png']
  },
  alternates: {
    canonical: 'https://homeforpup.com/ethical-guidelines'
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
};

export default function EthicalGuidelinesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
