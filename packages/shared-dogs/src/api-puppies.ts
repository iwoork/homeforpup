import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { Dog, Kennel } from '@homeforpup/shared-types';
import { PuppyWithKennel } from './components/PuppyCard';

// Configure AWS SDK v3
const createDynamoClient = () => {
  const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';

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
  private dynamodb: DynamoDBDocumentClient;

  constructor() {
    this.dynamodb = createDynamoClient();
  }

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

    console.log('Fetching available puppies with filters:', filters);

    // First, get all available puppies from the dogs table
    const dogsParams: any = {
      TableName: DOGS_TABLE,
      FilterExpression: 'dogType = :dogType AND breedingStatus = :status',
      ExpressionAttributeValues: {
        ':dogType': 'puppy',
        ':status': 'available',
      },
    };

    // Add additional filters
    const filterExpressions = ['dogType = :dogType', 'breedingStatus = :status'];
    const expressionAttributeNames: Record<string, string> = {};

    if (breed) {
      filterExpressions.push('breed = :breed');
      dogsParams.ExpressionAttributeValues[':breed'] = breed;
    }

    if (gender) {
      filterExpressions.push('gender = :gender');
      dogsParams.ExpressionAttributeValues[':gender'] = gender;
    }

    dogsParams.FilterExpression = filterExpressions.join(' AND ');
    if (Object.keys(expressionAttributeNames).length > 0) {
      dogsParams.ExpressionAttributeNames = expressionAttributeNames;
    }

    console.log('Dogs query params:', JSON.stringify(dogsParams, null, 2));

    const dogsResult = await this.dynamodb.send(new ScanCommand(dogsParams));
    const dogs = (dogsResult.Items as Dog[]) || [];

    console.log(`Found ${dogs.length} available puppies`);
    
    // If no real puppies found, fall back to generating from breeders (like the old system)
    if (dogs.length === 0) {
      console.log('No real puppies found in dogs table. Falling back to breeder-based puppy generation.');
      return this.generatePuppiesFromBreeders(filters);
    }

    // Get unique kennel IDs from the dogs
    const kennelIds = [...new Set(dogs.map(dog => dog.kennelId).filter(Boolean))] as string[];
    
    console.log(`Need to fetch ${kennelIds.length} kennels:`, kennelIds);

    // Fetch all kennels in parallel
    const kennelPromises = kennelIds.map(async (kennelId) => {
      try {
        const kennelParams = {
          TableName: KENNELS_TABLE,
          Key: { id: kennelId },
        };
        const result = await this.dynamodb.send(new GetCommand(kennelParams));
        return result.Item as Kennel;
      } catch (error) {
        console.error(`Error fetching kennel ${kennelId}:`, error);
        return null;
      }
    });

    const kennels = (await Promise.all(kennelPromises)).filter(Boolean) as Kennel[];
    console.log(`Successfully fetched ${kennels.length} kennels`);

    // Create a kennel lookup map
    const kennelMap = new Map<string, Kennel>();
    kennels.forEach(kennel => {
      if (kennel) {
        kennelMap.set(kennel.id, kennel);
      }
    });

    // Combine dogs with their kennel information
    let puppiesWithKennels: PuppyWithKennel[] = dogs.map(dog => {
      const kennel = dog.kennelId ? kennelMap.get(dog.kennelId) : undefined;
      
      // Calculate age in weeks
      const birthDate = new Date(dog.birthDate);
      const now = new Date();
      const ageWeeks = Math.floor((now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7));

      return {
        ...dog,
        kennel,
        image: dog.photoUrl, // Map photoUrl to image for compatibility
        ageWeeks,
        location: kennel?.address ? `${kennel.address.city}, ${kennel.address.state}` : 'Location not specified',
        country: kennel?.address?.country || 'Country not specified',
      };
    });

    // Apply kennel-based filters
    if (country) {
      puppiesWithKennels = puppiesWithKennels.filter(puppy => 
        puppy.kennel?.address?.country?.toLowerCase() === country.toLowerCase()
      );
    }

    if (state) {
      puppiesWithKennels = puppiesWithKennels.filter(puppy => 
        puppy.kennel?.address?.state?.toLowerCase() === state.toLowerCase()
      );
    }

    if (verified) {
      puppiesWithKennels = puppiesWithKennels.filter(puppy => 
        puppy.kennel?.isActive === true
      );
    }


    // Sort by creation date (newest first)
    puppiesWithKennels.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Calculate pagination
    const totalCount = puppiesWithKennels.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPuppies = puppiesWithKennels.slice(startIndex, endIndex);

    // Extract filter options from all puppies (before pagination)
    const availableCountries = [...new Set(puppiesWithKennels
      .map(p => p.kennel?.address?.country)
      .filter((country): country is string => Boolean(country))
    )].sort();
    
    const availableStates = [...new Set(puppiesWithKennels
      .map(p => p.kennel?.address?.state)
      .filter((state): state is string => Boolean(state))
    )].sort();
    
    const availableBreeds = [...new Set(puppiesWithKennels
      .map(p => p.breed)
      .filter((breed): breed is string => Boolean(breed))
    )].sort();

    // Calculate stats
    const totalPuppies = puppiesWithKennels.length;

    console.log(`Returning ${paginatedPuppies.length} puppies for page ${page} of ${totalPages}`);

    return {
      puppies: paginatedPuppies,
      total: totalCount,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: {
        availableStates,
        availableBreeds,
        availableCountries,
      },
      stats: {
        totalPuppies: totalCount,
      },
    };
  }

  // Fallback method: Generate puppies from breeders (like the old system)
  async generatePuppiesFromBreeders(filters: PuppyFilters = {}): Promise<PuppiesResponse> {
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

    console.log('Generating puppies from breeders with filters:', filters);

    // Build DynamoDB query parameters for breeders
    const params: any = {
      TableName: BREEDERS_TABLE,
      FilterExpression: 'available_puppies > :zero',
      ExpressionAttributeValues: {
        ':zero': 0,
      },
    };

    const filterExpressions = ['available_puppies > :zero'];

    // Add country filter
    if (country) {
      filterExpressions.push('country = :country');
      params.ExpressionAttributeValues[':country'] = country;
    }

    // Add state filter
    if (state) {
      filterExpressions.push('#state = :state');
      params.ExpressionAttributeNames = { '#state': 'state' };
      params.ExpressionAttributeValues[':state'] = state;
    }

    // Add breed filter
    if (breed) {
      filterExpressions.push('contains(breeds, :breed)');
      params.ExpressionAttributeValues[':breed'] = breed;
    }

    // Add verified filter
    if (verified) {
      filterExpressions.push('#verified = :verified');
      params.ExpressionAttributeNames = { ...params.ExpressionAttributeNames, '#verified': 'verified' };
      params.ExpressionAttributeValues[':verified'] = 'True';
    }

    // Add shipping filter
    if (shipping) {
      filterExpressions.push('#shipping = :shipping');
      params.ExpressionAttributeNames = { ...params.ExpressionAttributeNames, '#shipping': 'shipping' };
      params.ExpressionAttributeValues[':shipping'] = true;
    }

    params.FilterExpression = filterExpressions.join(' AND ');

    console.log('Breeders query params:', JSON.stringify(params, null, 2));

    // Scan breeders
    const result = await this.dynamodb.send(new ScanCommand(params));
    const breeders = result.Items || [];

    console.log(`Found ${breeders.length} breeders with available puppies`);

    // Generate puppies from breeders
    let puppies = this.generatePuppiesFromBreedersData(breeders);

    // Apply additional filters
    if (gender) {
      puppies = puppies.filter(p => p.gender === gender);
    }

    // Sort by creation date (newest first)
    puppies.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Pagination
    const totalCount = puppies.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedPuppies = puppies.slice(startIndex, endIndex);

    // Extract filter options
    const availableStates = [...new Set(breeders.map((b: any) => b.state))].sort();
    const availableBreeds = [...new Set(breeders.flatMap((b: any) => b.breeds))].sort();
    const availableCountries = [...new Set(breeders.map((b: any) => b.country))].sort();

    console.log(`Returning ${paginatedPuppies.length} generated puppies for page ${page} of ${totalPages}`);

    return {
      puppies: paginatedPuppies,
      total: totalCount,
      totalPages,
      page,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
      filters: {
        availableStates,
        availableBreeds,
        availableCountries,
      },
      stats: {
        totalPuppies: totalCount,
      },
    };
  }

  // Helper method to generate puppies from breeder data
  private generatePuppiesFromBreedersData(breeders: any[]): PuppyWithKennel[] {
    const puppies: PuppyWithKennel[] = [];
    
    breeders.forEach((breeder, index) => {
      if (breeder.available_puppies > 0) {
        const puppyCount = Math.min(breeder.available_puppies, 5); // Max 5 puppies per breeder
        
        for (let i = 0; i < puppyCount; i++) {
          const gender = Math.random() > 0.5 ? 'male' : 'female';
          const ageWeeks = Math.floor(Math.random() * 12) + 8; // 8-20 weeks
          const birthDate = new Date();
          birthDate.setDate(birthDate.getDate() - (ageWeeks * 7));
          
          // Create a mock kennel from breeder data
          const mockKennel: Kennel = {
            id: `kennel-${breeder.id}`,
            ownerId: breeder.id.toString(),
            name: breeder.business_name || breeder.name,
            description: `Professional kennel specializing in ${breeder.breeds?.join(', ')}`,
            address: {
              street: breeder.address || '',
              city: breeder.city || '',
              state: breeder.state || '',
              zipCode: breeder.zip_code || '',
              country: breeder.country || '',
            },
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

          const puppy: PuppyWithKennel = {
            id: `${breeder.id}-puppy-${i + 1}`,
            ownerId: breeder.id.toString(),
            kennelId: mockKennel.id,
            name: this.generatePuppyName(gender),
            breed: breeder.breeds?.[Math.floor(Math.random() * breeder.breeds.length)] || 'Mixed',
            gender,
            birthDate: birthDate.toISOString(),
            weight: Math.floor(Math.random() * 20) + 5, // 5-25 lbs
            color: this.generatePuppyColor(),
            description: `Beautiful ${breeder.breeds?.[0] || 'Mixed'} puppy from ${breeder.business_name || breeder.name}. Health tested and ready for a loving home.`,
            breedingStatus: 'available' as const,
            healthStatus: 'excellent' as const,
            dogType: 'puppy' as const,
            healthTests: [],
            photoUrl: this.generateDogImage(breeder.id, i),
            createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date().toISOString(),
            
            // Additional fields for PuppyWithKennel
            kennel: mockKennel,
            image: this.generateDogImage(breeder.id, i),
            ageWeeks,
            location: `${breeder.city}, ${breeder.state}`,
            country: breeder.country,
          };
          
          puppies.push(puppy);
        }
      }
    });
    
    return puppies;
  }

  // Helper methods for generating puppy data
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
    // Use placedog.net for reliable dog images
    const imageId = (breederId * 10 + puppyIndex) % 1000; // Generate unique ID based on breeder and puppy
    return `https://placedog.net/400/300?random=${imageId}`;
  }
}

// Create a singleton instance
export const puppiesApiClient = new PuppiesApiClient();
