import { Metadata } from 'next';
import { generateMetadata as createMetadata, generatePersonSchema } from '@/lib/utils/seo';

interface Breeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
}

async function fetchBreeder(id: string): Promise<Breeder | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/breeders/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    const data = await response.json();
    return data.breeder || data; // Handle both wrapped and direct responses
  } catch (error) {
    console.error('Error fetching breeder for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const breeder = await fetchBreeder(id);
  
  if (!breeder) {
    return createMetadata({
      title: 'Breeder Not Found',
      description: 'The breeder profile you\'re looking for doesn\'t exist or has been removed.',
      url: `/breeders/${id}`,
      noIndex: true,
    });
  }

  const displayName = breeder.name;
  const businessName = breeder.businessName;
  
  let title = displayName;
  if (businessName) {
    title = `${displayName} - ${businessName}`;
  } else {
    title = `${displayName} - Breeder`;
  }
  
  let description = breeder.about || 
    `Connect with ${displayName}, a trusted breeder on HomeForPup.`;
  
  if (breeder.specialties && breeder.specialties.length > 0) {
    description += ` Specializing in ${breeder.specialties.join(', ')}.`;
  }
  
  if (breeder.experience) {
    description += ` With ${breeder.experience} years of experience.`;
  }
  
  const location = breeder.location;
  if (location) {
    description += ` Located in ${location}.`;
  }

  const keywords = [
    'breeder',
    'breeder',
    'ethical breeder',
    businessName || '',
    ...(breeder.specialties || []),
    location || '',
  ].filter(Boolean);

  return createMetadata({
    title,
    description,
    keywords,
    image: breeder.profileImage,
    url: `/breeders/${id}`,
    type: 'profile',
  });
}

export default function BreederProfileLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  return (
    <>
      {children}
    </>
  );
}
