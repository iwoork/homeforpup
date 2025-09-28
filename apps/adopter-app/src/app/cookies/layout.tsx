import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cookie Policy | HomeForPup',
  description: 'Learn about how HomeForPup uses cookies to enhance your experience, ensure security, and provide personalized services for pet adoption.',
  keywords: [
    'cookie policy',
    'privacy',
    'data protection',
    'pet adoption',
    'HomeForPup',
    'website cookies',
    'user preferences',
    'privacy policy',
    'data security'
  ],
  openGraph: {
    title: 'Cookie Policy | HomeForPup',
    description: 'Learn about how HomeForPup uses cookies to enhance your experience, ensure security, and provide personalized services for pet adoption.',
    type: 'website',
    url: 'https://homeforpup.com/cookies',
    images: [
      {
        url: 'https://homeforpup.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'HomeForPup Cookie Policy',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Cookie Policy | HomeForPup',
    description: 'Learn about how HomeForPup uses cookies to enhance your experience, ensure security, and provide personalized services for pet adoption.',
    images: ['https://homeforpup.com/logo.png'],
  },
  authors: [{ name: 'HomeForPup Team' }],
  creator: 'HomeForPup',
  publisher: 'HomeForPup',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://homeforpup.com/cookies',
  },
};

export default function CookiesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
