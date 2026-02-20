import { db, dogs, kennels, breeders, eq, and, sql } from '@homeforpup/database';
import { Dog, Kennel } from '@homeforpup/shared-types';
import { PuppyWithKennel } from './components/PuppyCard';

export interface PuppyFilters {
  country?: string;
  state?: string;
  breed?: string;
  gender?: 'male' | 'female';
  shipping?: boolean;
  verified?: boolean;
  page?: number;
  limit?: number;
}

export interface PuppiesResponse {
  puppies: PuppyWithKennel[];
  total: number;
  totalPages: number;
  page: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  filters?: {
    availableStates: string[];
    availableBreeds: string[];
    availableCountries: string[];
  };
  stats?: {
    totalPuppies: number;
  };
}

export class PuppiesApiClient {
  async getAvailablePuppies(filters: PuppyFilters = {}): Promise<PuppiesResponse> {
    const {
      country,
      state,
      breed,
      gender,
      shipping = false,
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

    const allDogs = await db
      .select()
      .from(dogs)
      .where(and(...conditions)) as Dog[];

    if (allDogs.length === 0) {
      return this.generatePuppiesFromBreeders(filters);
    }

    // Get unique kennel IDs
    const kennelIds = [...new Set(allDogs.map(d => d.kennelId).filter(Boolean))] as string[];

    // Fetch all kennels
    let kennelList: Kennel[] = [];
    if (kennelIds.length > 0) {
      const { inArray } = await import('drizzle-orm');
      kennelList = await db
        .select()
        .from(kennels)
        .where(inArray(kennels.id, kennelIds)) as unknown as Kennel[];
    }

    const kennelMap = new Map<string, Kennel>();
    kennelList.forEach(k => kennelMap.set(k.id, k));

    // Combine dogs with kennel info
    let puppiesWithKennels: PuppyWithKennel[] = allDogs.map(dog => {
      const kennel = dog.kennelId ? kennelMap.get(dog.kennelId) : undefined;
      const birthDate = new Date(dog.birthDate);
      const now = new Date();
      const ageWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      const profilePhoto = (dog as any).photoGallery?.find((p: any) => p.isProfilePhoto)?.url;
      const firstPhoto = (dog as any).photoGallery?.[0]?.url;
      const dogPhotoUrl = dog.photoUrl || profilePhoto || firstPhoto;

      return {
        ...dog,
        kennel,
        image: dogPhotoUrl || this.generateDogImage(parseInt(dog.id.slice(-3)), 0),
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

  async generatePuppiesFromBreeders(filters: PuppyFilters = {}): Promise<PuppiesResponse> {
    const { country, state, breed, gender, shipping = false, verified = false, page = 1, limit = 12 } = filters;

    const conditions: any[] = [sql`${breeders.availablePuppies} > 0`];
    if (country) conditions.push(eq(breeders.country, country));
    if (state) conditions.push(eq(breeders.state, state));
    if (breed) conditions.push(sql`${breeders.breeds}::jsonb @> ${JSON.stringify([breed])}::jsonb`);
    if (verified) conditions.push(eq(breeders.verified, 'True'));

    const { and: andOp } = await import('drizzle-orm');
    const allBreeders = await db
      .select()
      .from(breeders)
      .where(andOp(...conditions));

    let puppiesList = this.generatePuppiesFromBreedersData(allBreeders as any[]);

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

  private generatePuppiesFromBreedersData(breedersList: any[]): PuppyWithKennel[] {
    const puppiesList: PuppyWithKennel[] = [];
    breedersList.forEach((breeder, _index) => {
      if (breeder.availablePuppies > 0) {
        const puppyCount = Math.min(breeder.availablePuppies, 5);
        for (let i = 0; i < puppyCount; i++) {
          const gender = Math.random() > 0.5 ? 'male' : 'female';
          const ageWeeks = Math.floor(Math.random() * 12) + 8;
          const birthDate = new Date();
          birthDate.setDate(birthDate.getDate() - (ageWeeks * 7));

          const mockKennel: Kennel = {
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
            name: this.generatePuppyName(gender as 'male' | 'female'),
            breed: (breeder.breeds as string[])?.[Math.floor(Math.random() * ((breeder.breeds as string[])?.length || 1))] || 'Mixed',
            gender: gender as 'male' | 'female',
            birthDate: birthDate.toISOString(),
            weight: Math.floor(Math.random() * 20) + 5,
            color: this.generatePuppyColor(),
            description: `Beautiful ${(breeder.breeds as string[])?.[0] || 'Mixed'} puppy from ${breeder.businessName || breeder.name}. Health tested and ready for a loving home.`,
            breedingStatus: 'available' as const,
            healthStatus: 'excellent' as const,
            dogType: 'puppy' as const,
            healthTests: [],
            photoUrl: this.generateDogImage(parseInt(breeder.id) || 0, i),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            kennel: mockKennel,
            image: this.generateDogImage(parseInt(breeder.id) || 0, i),
            ageWeeks,
            location: `${breeder.city}, ${breeder.state}`,
            country: breeder.country,
          } as any);
        }
      }
    });
    return puppiesList;
  }

  private generatePuppyName(gender: 'male' | 'female'): string {
    const maleNames = ['Max', 'Charlie', 'Cooper', 'Buddy', 'Rocky', 'Tucker', 'Jack', 'Bear', 'Duke', 'Zeus'];
    const femaleNames = ['Bella', 'Luna', 'Lucy', 'Daisy', 'Mia', 'Sophie', 'Ruby', 'Lola', 'Zoe', 'Molly'];
    const names = gender === 'male' ? maleNames : femaleNames;
    return names[Math.floor(Math.random() * names.length)];
  }

  private generatePuppyColor(): string {
    const colors = ['Black', 'Brown', 'White', 'Golden', 'Cream', 'Red', 'Blue', 'Chocolate', 'Sable', 'Brindle'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  private generateDogImage(breederId: number, puppyIndex: number): string {
    const imageId = (breederId * 10 + puppyIndex) % 1000;
    return `https://placedog.net/400/300?random=${imageId}`;
  }
}

export const puppiesApiClient = new PuppiesApiClient();
