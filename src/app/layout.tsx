import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '@/components/Providers';
import Layout from '@/components/layout/ConditionalLayout';
import GoogleAnalytics from '@/components/GoogleAnalytics';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Find Your Perfect Puppy | Ethical Breeders & Dog Families – HomeForPup',
  description:
    'Discover puppies from trusted dog families and ethical breeders. Join the HomeForPup community to find your perfect match and stay connected after adoption.',
  keywords: [
    'puppies for adoption',
    'ethical dog breeders',
    'family raised puppies',
    'puppy adoption community',
    'find a puppy online',
  ],
  openGraph: {
    title: 'Find Your Perfect Puppy | HomeForPup',
    description:
      'Connect with ethical breeders and loving dog families. HomeForPup helps you find puppies and build lasting community connections.',
    url: 'https://homeforpup.com',
    siteName: 'HomeForPup',
    images: [
      {
        url: 'https://homeforpup.com/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'HomeForPup Puppies',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Find Your Perfect Puppy | HomeForPup',
    description:
      'Join a community connecting dog families and ethical breeders to help you find your perfect pup.',
    images: ['https://homeforpup.com/twitter-card.jpg'],
  },
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className} style={{ margin: 0, padding: 0, backgroundColor: '#fafafa' }}>
        <GoogleAnalytics />
        <Providers>
          <Layout>
            {children}
          </Layout>
        </Providers>
      </body>
    </html>
  );
}