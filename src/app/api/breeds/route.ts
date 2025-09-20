// app/api/breeds/route.ts (Enhanced for new data model)

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '', // Fixed: was AWS_SECRET_KEY
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const BREEDS_TABLE = process.env.BREEDS_TABLE_NAME || 'homeforpup-breeds';
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';

// Enhanced breed interface matching Python script
interface BreedItem {
  id: number;
  name: string;
  alt_names: string[];
  overview_page: boolean;
  url: string;
  cover_photo_url: string;
  live: string; // DynamoDB stores as string for GSI
  hybrid: boolean;
  slug: string;
  search_terms: string[];
  breed_type: string; // 'purebred', 'hybrid', 'designer'
  size_category: string; // 'toy', 'small', 'medium', 'large', 'giant'
  breed_group: string; // 'sporting', 'hound', 'working', etc.
}

// Transform breed data for frontend
interface TransformedBreed {
  id: string;
  name: string;
  category: string;
  size: string;
  image: string;
  images?: string[];
  overview: string;
  characteristics: {
    energyLevel: number;
    friendliness: number;
    trainability: number;
    groomingNeeds: number;
    goodWithKids: number;
    goodWithPets: number;
  };
  physicalTraits: {
    weight: string;
    height: string;
    lifespan: string;
    coat: string;
  };
  temperament: string[];
  idealFor: string[];
  exerciseNeeds: string;
  commonHealthIssues: string[];
  groomingTips: string;
  trainingTips: string;
  funFacts: string[];
  breedType: string;
  hybrid: boolean;
  altNames: string[];
  url: string;
  breederCount?: number; // Number of available breeders
}

// Helper functions
const normalizeSize = (sizeCategory: string): string => {
  const sizeMap: { [key: string]: string } = {
    'toy': 'Small',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'giant': 'Large'
  };
  return sizeMap[sizeCategory] || 'Medium';
};

const normalizeCategory = (breedGroup: string): string => {
  const categoryMap: { [key: string]: string } = {
    'sporting': 'Sporting',
    'hound': 'Hound',
    'working': 'Working',
    'terrier': 'Terrier',
    'toy': 'Toy',
    'non-sporting': 'Non-Sporting',
    'herding': 'Herding',
    'mixed': 'Mixed'
  };
  return categoryMap[breedGroup] || 'Mixed';
};

// Generate realistic characteristics based on breed data
const generateCharacteristics = (breedGroup: string, sizeCategory: string, breedType: string) => {
  const baseStats: Record<string, { energy: number; friendly: number; train: number; groom: number; kids: number; pets: number }> = {
    'sporting': { energy: 8, friendly: 9, train: 8, groom: 6, kids: 9, pets: 7 },
    'hound': { energy: 7, friendly: 8, train: 6, groom: 4, kids: 8, pets: 6 },
    'working': { energy: 8, friendly: 7, train: 9, groom: 6, kids: 7, pets: 6 },
    'terrier': { energy: 9, friendly: 6, train: 7, groom: 5, kids: 6, pets: 5 },
    'toy': { energy: 6, friendly: 8, train: 7, groom: 7, kids: 7, pets: 6 },
    'non-sporting': { energy: 6, friendly: 8, train: 7, groom: 6, kids: 8, pets: 7 },
    'herding': { energy: 9, friendly: 8, train: 9, groom: 7, kids: 8, pets: 7 },
    'mixed': { energy: 7, friendly: 8, train: 7, groom: 6, kids: 8, pets: 7 }
  };

  const stats = baseStats[breedGroup] || baseStats['mixed'];
  
  // Adjust for size
  if (sizeCategory === 'toy' || sizeCategory === 'small') {
    stats.energy = Math.max(1, stats.energy - 1);
    stats.kids = Math.max(1, stats.kids - 1);
  }
  
  // Adjust for hybrid/designer breeds
  if (breedType === 'hybrid' || breedType === 'designer') {
    stats.friendly = Math.min(10, stats.friendly + 1);
    stats.train = Math.min(10, stats.train + 1);
  }

  return {
    energyLevel: stats.energy,
    friendliness: stats.friendly,
    trainability: stats.train,
    groomingNeeds: stats.groom,
    goodWithKids: stats.kids,
    goodWithPets: stats.pets
  };
};

const generateTemperament = (breedGroup: string, breedType: string): string[] => {
  const temperamentMap: { [key: string]: string[] } = {
    'sporting': ['Active', 'Friendly', 'Energetic', 'Loyal', 'Intelligent', 'Eager to Please'],
    'hound': ['Independent', 'Gentle', 'Determined', 'Friendly', 'Patient', 'Vocal'],
    'working': ['Confident', 'Strong', 'Loyal', 'Alert', 'Hardworking', 'Protective'],
    'terrier': ['Bold', 'Energetic', 'Alert', 'Determined', 'Spirited', 'Feisty'],
    'toy': ['Affectionate', 'Alert', 'Companionable', 'Spirited', 'Gentle', 'Devoted'],
    'non-sporting': ['Varied', 'Adaptable', 'Friendly', 'Intelligent', 'Calm', 'Sturdy'],
    'herding': ['Intelligent', 'Alert', 'Responsive', 'Energetic', 'Loyal', 'Protective'],
    'mixed': ['Friendly', 'Adaptable', 'Loyal', 'Gentle', 'Intelligent', 'Balanced']
  };
  
  let traits = temperamentMap[breedGroup] || temperamentMap['mixed'];
  
  if (breedType === 'designer') {
    traits = [...traits, 'Hybrid Vigor', 'Well-Balanced'];
  }
  
  return traits.slice(0, 5);
};

const generatePhysicalTraits = (sizeCategory: string, breedGroup: string) => {
  const sizeTraits: Record<string, { weight: string; height: string; lifespan: string }> = {
    'toy': { weight: '2-6 kg', height: '15-25 cm', lifespan: '12-16 years' },
    'small': { weight: '5-11 kg', height: '25-40 cm', lifespan: '12-15 years' },
    'medium': { weight: '11-25 kg', height: '40-60 cm', lifespan: '10-14 years' },
    'large': { weight: '25-45 kg', height: '60-70 cm', lifespan: '8-12 years' },
    'giant': { weight: '45+ kg', height: '70+ cm', lifespan: '6-10 years' }
  };
  
  const coatMap: Record<string, string> = {
    'sporting': 'Water-resistant, medium length',
    'hound': 'Short to medium, weather-resistant',
    'working': 'Double coat, weather-resistant',
    'terrier': 'Wiry or smooth, easy-care',
    'toy': 'Varied, often silky',
    'non-sporting': 'Varied by breed',
    'herding': 'Double coat, weather-resistant'
  };
  
  return {
    ...sizeTraits[sizeCategory],
    coat: coatMap[breedGroup] || 'Varies by breed'
  };
};

// Count available breeders for a breed
const getBreederCount = async (breedName: string): Promise<number> => {
  try {
    const params = {
      TableName: BREEDERS_TABLE,
      FilterExpression: 'contains(breeds, :breedName) AND active = :active',
      ExpressionAttributeValues: {
        ':breedName': breedName,
        ':active': 'True'
      },
      Select: 'COUNT' as const // Add 'as const' to ensure proper typing
    };
    
    const result = await dynamodb.send(new ScanCommand(params));
    return result.Count || 0;
  } catch (error) {
    console.error(`Error counting breeders for ${breedName}:`, error);
    return 0;
  }
};

const transformBreed = async (item: BreedItem): Promise<TransformedBreed> => {
  const size = normalizeSize(item.size_category);
  const category = normalizeCategory(item.breed_group);
  const characteristics = generateCharacteristics(item.breed_group, item.size_category, item.breed_type);
  
  // Get breeder count
  const breederCount = await getBreederCount(item.name);
  
  return {
    id: `breed-${item.id}`,
    name: item.name,
    category,
    size,
    image: item.cover_photo_url || `https://placedog.net/500?r&id=${item.name}`,
    images: item.cover_photo_url ? [item.cover_photo_url] : undefined,
    overview: `${item.hybrid ? 'A wonderful hybrid' : 'A distinguished'} ${size.toLowerCase()} breed from the ${category} group. ${item.breed_type === 'designer' ? 'This designer breed combines the best traits of its parent breeds.' : 'Known for their unique characteristics and loyal companionship.'}`,
    characteristics,
    physicalTraits: generatePhysicalTraits(item.size_category, item.breed_group),
    temperament: generateTemperament(item.breed_group, item.breed_type),
    idealFor: [
      'Dog lovers',
      item.size_category === 'toy' || item.size_category === 'small' ? 'Apartment living' : 'Active families',
      item.breed_group === 'sporting' || item.breed_group === 'working' ? 'Active owners' : 'Various lifestyles',
      'Responsible owners'
    ],
    exerciseNeeds: characteristics.energyLevel >= 8 ? 'High - 60+ minutes daily' :
                   characteristics.energyLevel >= 6 ? 'Moderate - 30-45 minutes daily' :
                   'Low to Moderate - 30 minutes daily',
    commonHealthIssues: ['General breed health considerations', 'Regular vet checkups recommended'],
    groomingTips: `Regular grooming appropriate for ${item.breed_group} breed characteristics.`,
    trainingTips: `Training approach suited for ${category} group temperament and ${item.breed_type} characteristics.`,
    funFacts: [
      `${item.breed_type === 'purebred' ? 'Purebred' : item.breed_type === 'hybrid' ? 'Hybrid' : 'Designer'} breed`,
      `Part of the ${category} group`,
      `Size classification: ${size}`,
      ...(item.alt_names.length > 0 ? [`Also known as: ${item.alt_names.slice(0, 2).join(', ')}`] : [])
    ],
    breedType: item.breed_type,
    hybrid: item.hybrid,
    altNames: item.alt_names,
    url: item.url,
    breederCount
  };
};

interface ScanParams {
  TableName: string;
  FilterExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, any>;
  IndexName?: string;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const breedType = searchParams.get('breedType'); // New filter
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'name'; // name, popularity, breedType

    console.log('API Request params:', { search, category, size, breedType, page, limit, sortBy });

    // Build DynamoDB query parameters
    const params: ScanParams = {
      TableName: BREEDS_TABLE,
    };

    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Only show live breeds
    filterExpressions.push('#live = :live');
    expressionAttributeNames['#live'] = 'live';
    expressionAttributeValues[':live'] = 'True';

    // Category filter using GSI if available
    if (category && category !== 'All') {
      const categoryMap: { [key: string]: string } = {
        'Sporting': 'sporting',
        'Hound': 'hound',
        'Working': 'working',
        'Terrier': 'terrier',
        'Toy': 'toy',
        'Non-Sporting': 'non-sporting',
        'Herding': 'herding',
        'Mixed': 'mixed'
      };
      
      if (categoryMap[category]) {
        filterExpressions.push('#breed_group = :breed_group');
        expressionAttributeNames['#breed_group'] = 'breed_group';
        expressionAttributeValues[':breed_group'] = categoryMap[category];
      }
    }

    // Size filter
    if (size && size !== 'All') {
      const sizeMap: { [key: string]: string[] } = { // Changed from string to string[]
        'Small': ['toy', 'small'],
        'Medium': ['medium'],
        'Large': ['large', 'giant']
      };
      
      const sizeCategories = sizeMap[size];
      if (sizeCategories) {
        if (sizeCategories.length === 1) {
          filterExpressions.push('#size_category = :size_category');
          expressionAttributeNames['#size_category'] = 'size_category';
          expressionAttributeValues[':size_category'] = sizeCategories[0];
        } else {
          // Multiple size categories
          const sizeConditions = sizeCategories.map((cat, index) => {
            expressionAttributeValues[`:size_category${index}`] = cat;
            return `#size_category = :size_category${index}`;
          });
          filterExpressions.push(`(${sizeConditions.join(' OR ')})`);
          expressionAttributeNames['#size_category'] = 'size_category';
        }
      }
    }

    // Breed type filter
    if (breedType && breedType !== 'All') {
      filterExpressions.push('#breed_type = :breed_type');
      expressionAttributeNames['#breed_type'] = 'breed_type';
      expressionAttributeValues[':breed_type'] = breedType.toLowerCase();
    }

    // Apply filters
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Execute scan
    const command = new ScanCommand(params);
    const result = await dynamodb.send(command);
    const items = (result.Items as BreedItem[]) || [];

    console.log('Raw DynamoDB results:', items.length);

    // Transform all breeds (with breeder counts)
    const allTransformedBreeds = await Promise.all(
      items.map(item => transformBreed(item))
    );

    // Apply client-side search filter
    let filteredBreeds = allTransformedBreeds;

    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredBreeds = filteredBreeds.filter(breed => 
        breed.name.toLowerCase().includes(searchLower) ||
        breed.altNames.some(alt => alt.toLowerCase().includes(searchLower)) ||
        breed.temperament.some(trait => trait.toLowerCase().includes(searchLower))
      );
      console.log('After search filter:', filteredBreeds.length);
    }

    // Sorting
    filteredBreeds.sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.breederCount || 0) - (a.breederCount || 0);
        case 'breedType':
          return a.breedType.localeCompare(b.breedType);
        case 'name':
        default:
          return a.name.localeCompare(b.name);
      }
    });

    // Apply pagination
    const totalCount = filteredBreeds.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBreeds = filteredBreeds.slice(startIndex, endIndex);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('Final pagination:', { 
      totalCount, 
      totalPages, 
      currentPage: page, 
      itemsOnPage: paginatedBreeds.length 
    });

    return NextResponse.json({
      breeds: paginatedBreeds,
      count: paginatedBreeds.length,
      total: totalCount,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      filters: {
        availableCategories: [...new Set(allTransformedBreeds.map(b => b.category))].sort(),
        availableSizes: [...new Set(allTransformedBreeds.map(b => b.size))].sort(),
        availableBreedTypes: [...new Set(allTransformedBreeds.map(b => b.breedType))].sort(),
        totalBreeders: allTransformedBreeds.reduce((sum, breed) => sum + (breed.breederCount || 0), 0)
      }
    });

  } catch (error) {
    console.error('Error fetching breeds:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching breeds',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}