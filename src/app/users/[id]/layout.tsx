import { Metadata } from 'next';
import { generateMetadata as createMetadata, generatePersonSchema } from '@/lib/utils/seo';
import StructuredData from '@/components/StructuredData';

interface User {
  userId: string;
  name: string;
  displayName?: string;
  userType: 'breeder' | 'puppy-parent' | 'both';
  puppyParentInfo?: {
    location?: string;
    bio?: string;
  };
  breederInfo?: {
    businessName?: string;
    location?: string;
    bio?: string;
  };
  profileImage?: string;
}

async function fetchUser(id: string): Promise<User | null> {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/users/${id}`, {
      next: { revalidate: 3600 }, // Revalidate every hour
    });
    
    if (!response.ok) {
      return null;
    }
    
    return response.json();
  } catch (error) {
    console.error('Error fetching user for metadata:', error);
    return null;
  }
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id } = await params;
  const user = await fetchUser(id);
  
  if (!user) {
    return createMetadata({
      title: 'User Not Found',
      description: 'The user profile you\'re looking for doesn\'t exist or has been removed.',
      url: `/users/${id}`,
      noIndex: true,
    });
  }

  const displayName = user.displayName || user.name;
  const isPuppyParent = user.userType === 'puppy-parent' || user.userType === 'both';
  const isDogProfessional = user.userType === 'breeder' || user.userType === 'both';
  
  let title = `${displayName}`;
  let description = `View ${displayName}'s profile on HomeForPup.`;
  
  if (isPuppyParent && isDogProfessional) {
    title = `${displayName} - Puppy Parent & Dog Professional`;
    description = `Connect with ${displayName}, both a puppy parent and breeder. ${user.puppyParentInfo?.bio || user.breederInfo?.bio || 'Active member of the HomeForPup community.'}`;
  } else if (isDogProfessional) {
    const businessName = user.breederInfo?.businessName;
    title = businessName ? `${displayName} - ${businessName}` : `${displayName} - Dog Professional`;
    description = `Connect with ${displayName}, a trusted breeder on HomeForPup. ${user.breederInfo?.bio || 'Committed to ethical breeding and dog care.'}`;
  } else if (isPuppyParent) {
    title = `${displayName} - Puppy Parent`;
    description = `Meet ${displayName}, a puppy parent in the HomeForPup community. ${user.puppyParentInfo?.bio || 'Passionate about dogs and responsible pet ownership.'}`;
  }

  const location = user.puppyParentInfo?.location || user.breederInfo?.location;
  if (location) {
    description += ` Located in ${location}.`;
  }

  return createMetadata({
    title,
    description,
    keywords: [
      'user profile',
      isPuppyParent ? 'puppy parent' : '',
      isDogProfessional ? 'breeder' : '',
      location || '',
    ].filter(Boolean),
    image: user.profileImage,
    url: `/users/${id}`,
    type: 'profile',
  });
}

export default function UserProfileLayout({
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
