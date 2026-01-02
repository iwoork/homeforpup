import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Initialize DynamoDB client
const client = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);

const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';

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
    id: number;
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
  businessName: breeder.business_name,
  rating: breeder.rating,
  reviewCount: breeder.review_count,
  verified: breeder.verified === 'True',
  phone: breeder.phone,
  email: breeder.email,
  website: breeder.website,
  shipping: breeder.shipping,
  pickupAvailable: breeder.pickup_available,
  responseRate: breeder.response_rate,
  avgResponseTime: breeder.avg_response_time,
});

// Generate sample puppies based on breeders
const generatePuppiesFromBreeders = (breeders: any[]): PuppyWithBreeder[] => {
  const puppies: PuppyWithBreeder[] = [];
  
  breeders.forEach((breeder, index) => {
    if (breeder.available_puppies > 0) {
      const puppyCount = Math.min(breeder.available_puppies, 5); // Max 5 puppies per breeder
      
      for (let i = 0; i < puppyCount; i++) {
        const gender = Math.random() > 0.5 ? 'male' : 'female';
        const ageWeeks = Math.floor(Math.random() * 12) + 8; // 8-20 weeks
        
        // Parse pricing range (e.g., "$1123-$3621" or "$2000")
        let basePrice = 2000; // Default price
        if (breeder.pricing) {
          const priceMatch = breeder.pricing.match(/\$?(\d+)(?:-\$?(\d+))?/);
          if (priceMatch) {
            const minPrice = parseInt(priceMatch[1]);
            const maxPrice = priceMatch[2] ? parseInt(priceMatch[2]) : minPrice;
            basePrice = Math.floor(Math.random() * (maxPrice - minPrice + 1)) + minPrice;
          }
        }
        
        const price = basePrice;
        
        const puppy: PuppyWithBreeder = {
          id: `${breeder.id}-puppy-${i + 1}`,
          name: generatePuppyName(gender),
          breed: breeder.breeds[Math.floor(Math.random() * breeder.breeds.length)],
          gender,
          ageWeeks,
          price,
          location: `${breeder.city}, ${breeder.state}`,
          country: breeder.country,
          state: breeder.state,
          city: breeder.city,
          breeder: transformBreederForPuppy(breeder),
          image: generateDogImage(breeder.id, i),
          available: true,
          description: `Beautiful ${breeder.breeds[0]} puppy from ${breeder.business_name}. Health tested and ready for a loving home.`,
          healthStatus: 'excellent',
          registrationNumber: `REG-${breeder.id}-${i + 1}`,
          microchipNumber: `CHIP-${breeder.id}-${i + 1}`,
          createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(), // Random date within last 30 days
        };
        
        puppies.push(puppy);
      }
    }
  });
  
  return puppies;
};

// Generate random puppy names
const generatePuppyName = (gender: 'male' | 'female'): string => {
  const maleNames = ['Max', 'Charlie', 'Cooper', 'Buddy', 'Rocky', 'Tucker', 'Jack', 'Bear', 'Duke', 'Zeus'];
  const femaleNames = ['Bella', 'Luna', 'Lucy', 'Daisy', 'Mia', 'Sophie', 'Ruby', 'Lola', 'Zoe', 'Molly'];
  
  const names = gender === 'male' ? maleNames : femaleNames;
  return names[Math.floor(Math.random() * names.length)];
};

// Generate dog image URL
const generateDogImage = (breederId: number, puppyIndex: number): string => {
  // Use placedog.net for reliable dog images
  const imageId = (breederId * 10 + puppyIndex) % 1000; // Generate unique ID based on breeder and puppy
  return `https://placedog.net/400/300?random=${imageId}`;
};

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Filter parameters
    const country = searchParams.get('country') || 'Canada'; // Default to Canada
    const state = searchParams.get('state');
    const breed = searchParams.get('breed');
    const gender = searchParams.get('gender');
    const minPrice = parseInt(searchParams.get('minPrice') || '0');
    const maxPrice = parseInt(searchParams.get('maxPrice') || '10000');
    const shipping = searchParams.get('shipping') === 'true';
    const verified = searchParams.get('verified') === 'true';
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    
    console.log('Puppies API Request params:', { 
      country, state, breed, gender, minPrice, maxPrice, shipping, verified, page, limit 
    });

    // Build DynamoDB query parameters for breeders
    const params: any = {
      TableName: BREEDERS_TABLE,
      FilterExpression: '#active = :active AND available_puppies > :zero',
      ExpressionAttributeNames: {
        '#active': 'active'
      },
      ExpressionAttributeValues: {
        ':active': 'True',
        ':zero': 0
      }
    };

    // Add country filter
    if (country) {
      params.FilterExpression += ' AND #country = :country';
      params.ExpressionAttributeNames['#country'] = 'country';
      params.ExpressionAttributeValues[':country'] = country;
    }

    // Add state filter
    if (state) {
      params.FilterExpression += ' AND #state = :state';
      params.ExpressionAttributeNames['#state'] = 'state';
      params.ExpressionAttributeValues[':state'] = state;
    }

    // Add breed filter
    if (breed) {
      params.FilterExpression += ' AND contains(#breeds, :breed)';
      params.ExpressionAttributeNames['#breeds'] = 'breeds';
      params.ExpressionAttributeValues[':breed'] = breed;
    }

    // Add verified filter
    if (verified) {
      params.FilterExpression += ' AND #verified = :verified';
      params.ExpressionAttributeNames['#verified'] = 'verified';
      params.ExpressionAttributeValues[':verified'] = 'True';
    }

    // Add shipping filter
    if (shipping) {
      params.FilterExpression += ' AND #shipping = :shipping';
      params.ExpressionAttributeNames['#shipping'] = 'shipping';
      params.ExpressionAttributeValues[':shipping'] = true;
    }

    // Scan breeders
    const result = await dynamodb.send(new ScanCommand(params));
    const breeders = result.Items || [];

    // Generate puppies from breeders
    let puppies = generatePuppiesFromBreeders(breeders);

    // Apply additional filters
    if (gender) {
      puppies = puppies.filter(p => p.gender === gender);
    }

    // Apply price filter
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
    const availableStates = [...new Set(breeders.map(b => b.state))].sort();
    const availableBreeds = [...new Set(breeders.flatMap(b => b.breeds))].sort();
    const availableCountries = [...new Set(breeders.map(b => b.country))].sort();

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
        verifiedCount: breeders.filter(b => b.verified === 'True').length
      },
      stats: {
        totalPuppies: totalCount,
        averageAge: Math.round(puppies.reduce((sum, p) => sum + p.ageWeeks, 0) / puppies.length) || 0,
        shippingAvailable: breeders.filter(b => b.shipping).length,
        verifiedBreeders: breeders.filter(b => b.verified === 'True').length
      }
    });

  } catch (error: any) {
    console.error('Error fetching puppies:', error);
    
    // Check if the table doesn't exist
    if (error.name === 'ResourceNotFoundException' || 
        error.message?.includes('ResourceNotFoundException') ||
        error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException') {
      console.error(`DynamoDB table "${BREEDERS_TABLE}" not found. Please create it first.`);
      return NextResponse.json({ 
        error: 'Breeders table not found',
        message: `The DynamoDB table "${BREEDERS_TABLE}" does not exist. Please run the setup script to create it: node scripts/setup-dynamodb-tables.js`,
        tableName: BREEDERS_TABLE
      }, { status: 503 }); // 503 Service Unavailable
    }
    
    return NextResponse.json({ 
      error: 'Failed to fetch puppies',
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 });
  }
}
