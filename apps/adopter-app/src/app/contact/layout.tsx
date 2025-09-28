import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contact Us | HomeForPup',
  description: 'Get in touch with HomeForPup for support, questions, or feedback. We\'re here to help you find your perfect furry companion.',
  keywords: [
    'contact HomeForPup',
    'customer support',
    'help center',
    'puppy adoption support',
    'breeder support',
    'technical support',
    'feedback',
    'customer service'
  ],
  openGraph: {
    title: 'Contact Us | HomeForPup',
    description: 'Get in touch with HomeForPup for support, questions, or feedback. We\'re here to help you find your perfect furry companion.',
    type: 'website',
    url: 'https://homeforpup.com/contact',
    images: [
      {
        url: 'https://homeforpup.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'HomeForPup Contact Us',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contact Us | HomeForPup',
    description: 'Get in touch with HomeForPup for support, questions, or feedback. We\'re here to help you find your perfect furry companion.',
    images: ['https://homeforpup.com/logo.png'],
  },
  authors: [{ name: 'HomeForPup Team' }],
  creator: 'HomeForPup',
  publisher: 'HomeForPup',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://homeforpup.com/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
