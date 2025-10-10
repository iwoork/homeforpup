import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accessibility Statement | HomeForPup',
  description: 'HomeForPup is committed to making pet adoption accessible to everyone. Learn about our accessibility features, compliance standards, and how we ensure an inclusive experience.',
  keywords: [
    'accessibility',
    'inclusive design',
    'WCAG compliance',
    'assistive technology',
    'pet adoption',
    'HomeForPup',
    'web accessibility',
    'disability support',
    'inclusive pet adoption',
    'accessible website'
  ],
  openGraph: {
    title: 'Accessibility Statement | HomeForPup',
    description: 'HomeForPup is committed to making pet adoption accessible to everyone. Learn about our accessibility features, compliance standards, and how we ensure an inclusive experience.',
    type: 'website',
    url: 'https://homeforpup.com/accessibility',
    images: [
      {
        url: 'https://homeforpup.com/logo.png',
        width: 1200,
        height: 630,
        alt: 'HomeForPup Accessibility Statement',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Accessibility Statement | HomeForPup',
    description: 'HomeForPup is committed to making pet adoption accessible to everyone. Learn about our accessibility features, compliance standards, and how we ensure an inclusive experience.',
    images: ['https://homeforpup.com/logo.png'],
  },
  authors: [{ name: 'HomeForPup Team' }],
  creator: 'HomeForPup',
  publisher: 'HomeForPup',
  robots: 'index, follow',
  alternates: {
    canonical: 'https://homeforpup.com/accessibility',
  },
};

export default function AccessibilityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
