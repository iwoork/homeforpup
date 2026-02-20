import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, kennels, breeders, eq, and, sql, inArray } from '@homeforpup/database';
import type { PuppyFilters } from '@homeforpup/shared-dogs';

import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parse query parameters
    const filters: PuppyFilters = {
      country: searchParams.get('country') || undefined,
      state: searchParams.get('state') || undefined,
      breed: searchParams.get('breed') || undefined,
      gender: (searchParams.get('gender') as 'male' | 'female') || undefined,
      shipping: searchParams.get('shipping') === 'true',
      verified: searchParams.get('verified') === 'true',
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      limit: searchParams.get('limit') ? parseInt(searchParams.get('limit')!) : 12,
    };

    console.log('Available puppies API called with filters:', filters);

    const {
      country,
      state,
      breed,
      gender,
      verified = false,
      page = 1,
      limit = 12,
    } = filters;

    // Build conditions for dogs query
    const conditions: any[] = [
      eq(dogs.dogType, 'puppy'),
      eq(dogs.breedingStatus, 'available'),
    ];
    if (breed) conditions.push(eq(dogs.breed, breed));
    if (gender) conditions.push(eq(dogs.gender, gender));

    const allDogs = await db.select().from(dogs).where(and(...conditions));

    if (allDogs.length === 0) {
      // Fallback: generate puppies from breeders data
      const result = await generatePuppiesFromBreeders(filters);
      return NextResponse.json(result);
    }

    // Get unique kennel IDs
    const kennelIds = [...new Set(allDogs.map(d => d.kennelId).filter(Boolean))] as string[];

    // Fetch all kennels
    let kennelList: any[] = [];
    if (kennelIds.length > 0) {
      kennelList = await db.select().from(kennels).where(inArray(kennels.id, kennelIds));
    }

    const kennelMap = new Map<string, any>();
    kennelList.forEach(k => kennelMap.set(k.id, k));

    // Combine dogs with kennel info
    let puppiesWithKennels = allDogs.map(dog => {
      const kennel = dog.kennelId ? kennelMap.get(dog.kennelId) : undefined;
      const birthDate = new Date(dog.birthDate);
      const now = new Date();
      const ageWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      const profilePhoto = dog.photoGallery?.find((p: any) => p.isProfilePhoto)?.url;
      const firstPhoto = dog.photoGallery?.[0]?.url;
      const dogPhotoUrl = dog.photoUrl || profilePhoto || firstPhoto;
      const imageId = (parseInt(dog.id.slice(-3)) || 0) * 10;

      return {
        ...dog,
        kennel,
        image: dogPhotoUrl || `https://placedog.net/400/300?random=${imageId}`,
        photoUrl: dogPhotoUrl,
        ageWeeks,
        location: kennel?.address ? `${(kennel.address as any).city}, ${(kennel.address as any).state}` : 'Location not specified',
        country: (kennel?.address as any)?.country || 'Country not specified',
      };
    });

    // Apply kennel-based filters
    if (country) {
      puppiesWithKennels = puppiesWithKennels.filter(p =>
        (p.kennel?.address as any)?.country?.toLowerCase() === country.toLowerCase()
      );
    }
    if (state) {
      puppiesWithKennels = puppiesWithKennels.filter(p =>
        (p.kennel?.address as any)?.state?.toLowerCase() === state.toLowerCase()
      );
    }
    if (verified) {
      puppiesWithKennels = puppiesWithKennels.filter(p =>
        (p.kennel as any)?.isActive === true
      );
    }

    puppiesWithKennels.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const totalCount = puppiesWithKennels.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPuppies = puppiesWithKennels.slice(startIndex, endIndex);

    const availableCountries = [...new Set(puppiesWithKennels.map(p => (p.kennel?.address as any)?.country).filter(Boolean))].sort();
    const availableStates = [...new Set(puppiesWithKennels.map(p => (p.kennel?.address as any)?.state).filter(Boolean))].sort();
    const availableBreeds = [...new Set(puppiesWithKennels.map(p => p.breed).filter(Boolean))].sort();

    return NextResponse.json({
      puppies: paginatedPuppies,
      total: totalCount,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: { availableStates, availableBreeds, availableCountries },
      stats: { totalPuppies: totalCount },
    });
  } catch (error) {
    console.error('Error fetching available puppies:', error);
    return NextResponse.json(
      {
        message: 'Error fetching available puppies',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Fallback: generate puppies from breeders data when no real dogs exist
async function generatePuppiesFromBreeders(filters: PuppyFilters) {
  const { country, state, breed, gender, verified = false, page = 1, limit = 12 } = filters;

  const conditions: any[] = [sql`${breeders.availablePuppies} > 0`];
  if (country) conditions.push(eq(breeders.country, country));
  if (state) conditions.push(eq(breeders.state, state));
  if (breed) conditions.push(sql`${breeders.breeds}::jsonb @> ${JSON.stringify([breed])}::jsonb`);
  if (verified) conditions.push(eq(breeders.verified, 'True'));

  const allBreeders = await db.select().from(breeders).where(and(...conditions));

  const maleNames = ['Max', 'Charlie', 'Cooper', 'Buddy', 'Rocky', 'Tucker', 'Jack', 'Bear', 'Duke', 'Zeus'];
  const femaleNames = ['Bella', 'Luna', 'Lucy', 'Daisy', 'Mia', 'Sophie', 'Ruby', 'Lola', 'Zoe', 'Molly'];
  const colors = ['Black', 'Brown', 'White', 'Golden', 'Cream', 'Red', 'Blue', 'Chocolate', 'Sable', 'Brindle'];

  let puppiesList: any[] = [];
  allBreeders.forEach((breeder) => {
    if ((breeder.availablePuppies || 0) > 0) {
      const puppyCount = Math.min(breeder.availablePuppies || 0, 5);
      for (let i = 0; i < puppyCount; i++) {
        const g = Math.random() > 0.5 ? 'male' : 'female';
        const ageWeeks = Math.floor(Math.random() * 12) + 8;
        const birthDate = new Date();
        birthDate.setDate(birthDate.getDate() - ageWeeks * 7);
        const breederId = parseInt(breeder.id) || 0;
        const names = g === 'male' ? maleNames : femaleNames;
        const imageId = (breederId * 10 + i) % 1000;

        const mockKennel = {
          id: `kennel-${breeder.id}`,
          ownerId: breeder.id.toString(),
          name: breeder.businessName || breeder.name,
          description: `Professional kennel specializing in ${(breeder.breeds as string[])?.join(', ')}`,
          address: { street: breeder.address || '', city: breeder.city || '', state: breeder.state || '', zipCode: breeder.zipCode || '', country: breeder.country || '' },
          phone: breeder.phone,
          email: breeder.email,
          website: breeder.website,
          specialties: breeder.breeds || [],
          establishedDate: '2020-01-01',
          isActive: true,
          isPublic: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        puppiesList.push({
          id: `${breeder.id}-puppy-${i + 1}`,
          ownerId: breeder.id.toString(),
          kennelId: mockKennel.id,
          name: names[Math.floor(Math.random() * names.length)],
          breed: (breeder.breeds as string[])?.[Math.floor(Math.random() * ((breeder.breeds as string[])?.length || 1))] || 'Mixed',
          gender: g,
          birthDate: birthDate.toISOString(),
          weight: Math.floor(Math.random() * 20) + 5,
          color: colors[Math.floor(Math.random() * colors.length)],
          description: `Beautiful ${(breeder.breeds as string[])?.[0] || 'Mixed'} puppy from ${breeder.businessName || breeder.name}. Health tested and ready for a loving home.`,
          breedingStatus: 'available',
          healthStatus: 'excellent',
          dogType: 'puppy',
          healthTests: [],
          photoUrl: `https://placedog.net/400/300?random=${imageId}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          updatedAt: new Date().toISOString(),
          kennel: mockKennel,
          image: `https://placedog.net/400/300?random=${imageId}`,
          ageWeeks,
          location: `${breeder.city}, ${breeder.state}`,
          country: breeder.country,
        });
      }
    }
  });

  if (gender) puppiesList = puppiesList.filter(p => p.gender === gender);

  puppiesList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const totalCount = puppiesList.length;
  const totalPages = Math.ceil(totalCount / limit);
  const startIndex = (page - 1) * limit;
  const paginatedPuppies = puppiesList.slice(startIndex, startIndex + limit);

  const availableStates = [...new Set(allBreeders.map((b: any) => b.state))].sort();
  const availableBreeds = [...new Set(allBreeders.flatMap((b: any) => (b.breeds as string[]) || []))].sort();
  const availableCountries = [...new Set(allBreeders.map((b: any) => b.country))].sort();

  return {
    puppies: paginatedPuppies,
    total: totalCount,
    totalPages,
    page,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
    filters: { availableStates, availableBreeds, availableCountries },
    stats: { totalPuppies: totalCount },
  };
}
