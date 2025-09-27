import { Metadata } from 'next';
import { generateMetadata as createMetadata, generateLocalBusinessSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

interface Kennel {
  id: string;
  name: string;
  description?: string;
  coverPhoto?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  businessType?: 'hobby' | 'commercial' | 'show' | 'working';
  specialties?: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
    website?: string;
  };
  ownerName?: string;
  isPublic: boolean;
}

async function fetchKennel(id: string): Promise<Kennel | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/kennels/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching kennel for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const kennel = await fetchKennel(id);
  
  if (!kennel || !kennel.isPublic) {
    return createMetadata({
      title: 'Kennel Not Found',
      description: 'The kennel profile you\'re looking for doesn\'t exist or is not publicly available.',
      url: `/kennels/${id}`,
      noIndex: true,
    });
  }

  const businessTypeLabel = kennel.businessType ? 
    kennel.businessType.charAt(0).toUpperCase() + kennel.businessType.slice(1) : '';
  
  let title = kennel.name;
  if (businessTypeLabel) {
    title += ` - ${businessTypeLabel} Kennel`;
  }
  
  let description = kennel.description || `Visit ${kennel.name}, a trusted kennel on HomeForPup.`;
  
  if (kennel.specialties && kennel.specialties.length > 0) {
    description += ` Specializing in ${kennel.specialties.join(', ')}.`;
  }
  
  const location = kennel.address ? 
    `${kennel.address.city}, ${kennel.address.state}` : '';
  
  if (location) {
    description += ` Located in ${location}.`;
  }

  if (kennel.ownerName) {
    description += ` Operated by ${kennel.ownerName}.`;
  }

  const keywords = [
    'kennel',
    'dog kennel',
    businessTypeLabel ? `${businessTypeLabel.toLowerCase()} breeder` : '',
    ...(kennel.specialties || []),
    location,
  ].filter(Boolean);

  return createMetadata({
    title,
    description,
    keywords,
    image: kennel.coverPhoto,
    url: `/kennels/${id}`,
    type: 'article',
  });
}

export default function KennelProfileLayout({
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
