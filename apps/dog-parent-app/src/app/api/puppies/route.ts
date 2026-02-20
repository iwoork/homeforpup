import { NextRequest, NextResponse } from 'next/server';
import { db, breeders, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// Interface for puppy with breeder info
interface PuppyWithBreeder {
  id: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  ageWeeks: number;
  price: number;
  location: string;
  country: string;
  state: string;
  city: string;
  breeder: {
    id: string;
    name: string;
    businessName: string;
    rating: number;
    reviewCount: number;
    verified: boolean;
    phone: string;
    email: string;
    website: string;
    shipping: boolean;
    pickupAvailable: boolean;
    responseRate: number;
    avgResponseTime: string;
  };
  image: string;
  available: boolean;
  description?: string;
  healthStatus: string;
  registrationNumber?: string;
  microchipNumber?: string;
  createdAt: string;
}

// Transform breeder data for puppy display
const transformBreederForPuppy = (breeder: any) => ({
  id: breeder.id,
  name: breeder.name,
  businessName: breeder.businessName,
  rating: breeder.rating,
  reviewCount: breeder.reviewCount,
  verified: breeder.verified === 'True',
  phone: breeder.phone,
  email: breeder.email,
  website: breeder.website,
  shipping: breeder.shipping,
  pickupAvailable: breeder.pickupAvailable,
  responseRate: breeder.responseRate,
  avgResponseTime: breeder.avgResponseTime,
});

// Generate sample puppies based on breeders
const generatePuppiesFromBreeders = (breedersList: any[]): PuppyWithBreeder[] => {
  const puppies: PuppyWithBreeder[] = [];

  breedersList.forEach((breeder) => {
    if (breeder.availablePuppies > 0) {
      const puppyCount = Math.min(breeder.availablePuppies, 5);
      const breederBreeds = (breeder.breeds as string[]) || [];

      for (let i = 0; i < puppyCount; i++) {
        const gender: 'male' | 'female' = Math.random() > 0.5 ? 'male' : 'female';
        const ageWeeks = Math.floor(Math.random() * 12) + 8;

        let basePrice = 2000;
        if (breeder.pricing) {
          const priceMatch = breeder.pricing.match(/\$?(\d+)(?:-\$?(\d+))?/);
          if (priceMatch) {
            const minPrice = parseInt(priceMatch[1]);
            const maxPrice = priceMatch[2] ? parseInt(priceMatch[2]) : minPrice;
            basePrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
          }
        }

        const breederId = parseInt(breeder.id) || 0;

        const puppy: PuppyWithBreeder = {
          id: `${breeder.id}-puppy-${i + 1}`,
          name: generatePuppyName(gender),
          breed: breederBreeds[Math.floor(Math.random() * breederBreeds.length)] || 'Mixed',
          gender,
          ageWeeks,
          price: basePrice,
          location: `${breeder.city}, ${breeder.state}`,
          country: breeder.country,
          state: breeder.state,
          city: breeder.city,
          breeder: transformBreederForPuppy(breeder),
          image: generateDogImage(breederId, i),
          available: true,
          description: `Beautiful ${breederBreeds[0] || 'breed'} puppy from ${breeder.businessName}. Health tested and ready for a loving home.`,
          healthStatus: 'excellent',
          registrationNumber: `REG-${breeder.id}-${i + 1}`,
          microchipNumber: `CHIP-${breeder.id}-${i + 1}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
        };

        puppies.push(puppy);
      }
    }
  });

  return puppies;
};

const generatePuppyName = (gender: 'male' | 'female'): string => {
  const maleNames = ['Max', 'Charlie', 'Cooper', 'Buddy', 'Rocky', 'Tucker', 'Jack', 'Bear', 'Duke', 'Zeus'];
  const femaleNames = ['Bella', 'Luna', 'Lucy', 'Daisy', 'Mia', 'Sophie', 'Ruby', 'Lola', 'Zoe', 'Molly'];
  const names = gender === 'male' ? maleNames : femaleNames;
  return names[Math.floor(Math.random() * names.length)];
};

const generateDogImage = (breederId: number, puppyIndex: number): string => {
  const imageId = (breederId * 10 + puppyIndex) % 1000;
  return `https://placedog.net/400/300?random=${imageId}`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const breederId = searchParams.get('breederId');
    const country = breederId ? searchParams.get('country') : (searchParams.get('country') || 'Canada');
    const state = searchParams.get('state');
    const breed = searchParams.get('breed');
    const gender = searchParams.get('gender');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000');
    const shipping = searchParams.get('shipping') === 'true';
    const verified = searchParams.get('verified') === 'true';

    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    console.log('Puppies API Request params:', {
      breederId, country, state, breed, gender, minPrice, maxPrice, shipping, verified, page, limit
    });

    // Build where conditions
    const conditions: string[] = [`${breeders.verified.name} = 'True'`, `${breeders.availablePuppies.name} > 0`];

    // Query breeders with filters
    let query = db.select().from(breeders)
      .where(sql`${breeders.verified} = 'True' AND ${breeders.availablePuppies} > 0`);

    let breedersList = await query;

    // Apply filters in memory (matching original behavior)
    if (breederId) {
      breedersList = breedersList.filter(b => String(b.id) === breederId);
    }
    if (country) {
      breedersList = breedersList.filter(b => b.country === country);
    }
    if (state) {
      breedersList = breedersList.filter(b => b.state === state);
    }
    if (breed) {
      breedersList = breedersList.filter(b => ((b.breeds as string[]) || []).some(br => br.toLowerCase().includes(breed.toLowerCase())));
    }
    if (verified) {
      breedersList = breedersList.filter(b => b.verified === 'True');
    }
    if (shipping) {
      breedersList = breedersList.filter(b => b.shipping === true);
    }

    // Generate puppies from breeders
    let puppies = generatePuppiesFromBreeders(breedersList);

    // Apply additional filters
    if (gender) {
      puppies = puppies.filter(p => p.gender === gender);
    }

    puppies = puppies.filter(p => p.price >= minPrice && p.price <= maxPrice);

    // Sort by creation date (newest first)
    puppies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const totalCount = puppies.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPuppies = puppies.slice(startIndex, endIndex);

    // Extract filter options
    const availableStates = [...new Set(breedersList.map(b => b.state).filter(Boolean))].sort() as string[];
    const availableBreeds = [...new Set(breedersList.flatMap(b => (b.breeds as string[]) || []))].sort();
    const availableCountries = [...new Set(breedersList.map(b => b.country).filter(Boolean))].sort() as string[];

    return NextResponse.json({
      puppies: paginatedPuppies,
      count: paginatedPuppies.length,
      total: totalCount,
      page,
      limit,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      filters: {
        availableStates,
        availableBreeds,
        availableCountries,
        averagePrice: Math.round(puppies.reduce((sum, p) => sum + p.price, 0) / puppies.length) || 0,
        verifiedCount: breedersList.filter(b => b.verified === 'True').length
      },
      stats: {
        totalPuppies: totalCount,
        averageAge: Math.round(puppies.reduce((sum, p) => sum + p.ageWeeks, 0) / puppies.length) || 0,
        shippingAvailable: breedersList.filter(b => b.shipping).length,
        verifiedBreeders: breedersList.filter(b => b.verified === 'True').length
      }
    });

  } catch (error: any) {
    console.error('Error fetching puppies:', error);

    return NextResponse.json({
      error: 'Failed to fetch puppies',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
