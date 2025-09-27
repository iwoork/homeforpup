import { Metadata } from 'next';

export interface SEOProps {
  title: string;
  description: string;
  keywords?: readonly string[] | string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  noIndex?: boolean;
  canonical?: string;
}

const DEFAULT_TITLE = 'HomeForPup - Find Your Perfect Puppy from Trusted Dog Professionals';
const DEFAULT_DESCRIPTION = 'Connect with ethical dog professionals and loving families. HomeForPup helps you find puppies and build lasting community connections through our trusted platform.';
const DEFAULT_IMAGE = 'https://homeforpup.com/og-image.jpg';
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://homeforpup.com';

export function generateMetadata({
  title,
  description,
  keywords = [],
  image = DEFAULT_IMAGE,
  url,
  type = 'website',
  noIndex = false,
  canonical,
}: SEOProps): Metadata {
  const fullTitle = title === DEFAULT_TITLE ? title : `${title} | HomeForPup`;
  const fullUrl = url ? `${SITE_URL}${url}` : SITE_URL;
  const canonicalUrl = canonical ? `${SITE_URL}${canonical}` : fullUrl;

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords: [
      ...(Array.isArray(keywords) ? keywords : []),
      'puppies',
      'dog professionals',
      'puppy parents',
      'ethical breeders',
      'family raised puppies',
      'puppy adoption',
      'dog community',
      'HomeForPup',
    ],
    authors: [{ name: 'HomeForPup Team' }],
    creator: 'HomeForPup',
    publisher: 'HomeForPup',
    openGraph: {
      title: fullTitle,
      description,
      url: fullUrl,
      siteName: 'HomeForPup',
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: `${title} - HomeForPup`,
        },
      ],
      type: type,
      locale: 'en_US',
    },
    twitter: {
      card: 'summary_large_image',
      title: fullTitle,
      description,
      images: [image],
      creator: '@homeforpup',
      site: '@homeforpup',
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
    alternates: {
      canonical: canonicalUrl,
    },
  };

  if (noIndex) {
    metadata.robots = {
      index: false,
      follow: false,
    };
  }

  return metadata;
}

// Predefined metadata for common pages
export const PAGE_METADATA = {
  home: {
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    keywords: ['find puppies', 'dog professionals', 'puppy matching', 'ethical breeding'],
    url: '/',
  },
  browse: {
    title: 'Browse Available Puppies',
    description: 'Discover adorable puppies from trusted dog professionals. Filter by breed, location, and preferences to find your perfect companion.',
    keywords: ['browse puppies', 'available puppies', 'puppy search', 'find puppy'],
    url: '/browse',
  },
  breeds: {
    title: 'Dog Breeds Guide',
    description: 'Comprehensive guide to dog breeds. Learn about temperament, size, care requirements, and find the perfect breed for your lifestyle.',
    keywords: ['dog breeds', 'breed guide', 'breed information', 'dog characteristics'],
    url: '/breeds',
  },
  breeders: {
    title: 'Find Trusted Dog Professionals',
    description: 'Connect with verified and trusted dog professionals in your area. Browse profiles, read reviews, and find the perfect match for your family.',
    keywords: ['dog professionals', 'trusted breeders', 'professional breeders', 'breeder directory'],
    url: '/breeders',
  },
  users: {
    title: 'Browse Puppy Parents Community',
    description: 'Connect with fellow puppy parents and dog enthusiasts. Share experiences, get advice, and build lasting friendships in our community.',
    keywords: ['puppy parents', 'dog community', 'pet owners', 'dog lovers'],
    url: '/users',
  },
  about: {
    title: 'About HomeForPup - Our Mission & Story',
    description: 'Learn about HomeForPup\'s mission to connect loving families with ethical dog professionals. Discover our story, values, and commitment to responsible pet ownership.',
    keywords: ['about homeforpup', 'our mission', 'pet platform', 'dog community'],
    url: '/about',
  },
  adoptionGuide: {
    title: 'Puppy Adoption Guide - Complete Guide for New Families',
    description: 'Complete guide to puppy adoption. Learn the process, what to expect, preparation tips, and how to ensure a smooth transition for your new companion.',
    keywords: ['puppy adoption guide', 'adoption process', 'new puppy tips', 'puppy preparation'],
    url: '/adoption-guide',
  },
  kennelManagement: {
    title: 'Professional Kennel Management Platform',
    description: 'Comprehensive kennel management tools for dog professionals. Manage multiple kennels, track dogs, post announcements, and connect with puppy parents.',
    keywords: ['kennel management', 'breeding software', 'dog professional tools', 'kennel platform'],
    url: '/kennel-management',
  },
  dashboard: {
    title: 'Dashboard - Manage Your Profile & Connections',
    description: 'Your personal dashboard to manage your profile, view messages, track interactions, and stay connected with the HomeForPup community.',
    keywords: ['dashboard', 'profile management', 'user dashboard'],
    url: '/dashboard',
    noIndex: true, // Private page
  },
  login: {
    title: 'Login to HomeForPup',
    description: 'Sign in to your HomeForPup account to access your dashboard, manage your profile, and connect with the dog community.',
    keywords: ['login', 'sign in', 'account access'],
    url: '/auth/login',
    noIndex: true, // No need to index auth pages
  },
  authError: {
    title: 'Authentication Error',
    description: 'There was an issue with authentication. Please try again or contact support if the problem persists.',
    url: '/auth/error',
    noIndex: true,
  },
} as const;

// Structured Data helpers
export function generateBreadcrumbSchema(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  };
}

export function generateOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'HomeForPup',
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULT_DESCRIPTION,
    sameAs: [
      // Add your social media URLs here
      // 'https://facebook.com/homeforpup',
      // 'https://twitter.com/homeforpup',
      // 'https://instagram.com/homeforpup',
    ],
  };
}

export function generatePersonSchema(person: {
  name: string;
  description?: string;
  image?: string;
  url: string;
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: person.name,
    description: person.description,
    image: person.image,
    url: `${SITE_URL}${person.url}`,
  };
}

export function generateLocalBusinessSchema(business: {
  name: string;
  description: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  phone?: string;
  email?: string;
  url: string;
}) {
  const schema: any = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: business.name,
    description: business.description,
    url: `${SITE_URL}${business.url}`,
  };

  if (business.address) {
    schema.address = {
      '@type': 'PostalAddress',
      streetAddress: business.address.street,
      addressLocality: business.address.city,
      addressRegion: business.address.state,
      postalCode: business.address.zipCode,
      addressCountry: business.address.country || 'US',
    };
  }

  if (business.phone) {
    schema.telephone = business.phone;
  }

  if (business.email) {
    schema.email = business.email;
  }

  return schema;
}
