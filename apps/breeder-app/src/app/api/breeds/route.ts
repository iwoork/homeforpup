// app/api/breeds/route.ts (Enhanced for new data model)

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const BREEDS_TABLE = process.env.BREEDS_TABLE_NAME || 'homeforpup-breeds-simple';

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
  altNames: string[];
  category: string;
  size: string;
  breedType: string;
  image: string;
  images?: string[];
  overview: string;
  characteristics: {
    energyLevel: number;
    trainability: number;
    friendliness: number;
    groomingNeeds: number;
    exerciseNeeds: number;
    barking: number;
    shedding: number;
    goodWithKids: number;
    goodWithDogs: number;
    goodWithCats: number;
    goodWithStrangers: number;
    protective: number;
    playful: number;
    calm: number;
    intelligent: number;
    independent: number;
    affectionate: number;
    social: number;
    confident: number;
    gentle: number;
    patient: number;
    energetic: number;
    loyal: number;
    alert: number;
    brave: number;
    stubborn: number;
    sensitive: number;
    adaptable: number;
    vocal: number;
    territorial: number;
  };
  physicalTraits: string[];
  temperament: string[];
  idealFor: string[];
  exerciseNeeds: string;
  commonHealthIssues: string[];
  groomingTips: string;
  trainingTips: string;
  funFacts: string[];
  breederCount?: number;
}

// Normalize size categories
const normalizeSize = (size: string): string => {
  const sizeMap: { [key: string]: string } = {
    'toy': 'Toy',
    'small': 'Small',
    'medium': 'Medium',
    'large': 'Large',
    'giant': 'Giant'
  };
  return sizeMap[size.toLowerCase()] || 'Medium';
};

// Normalize breed groups to categories
const normalizeCategory = (group: string): string => {
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
  return categoryMap[group.toLowerCase()] || 'Mixed';
};

// Generate characteristics based on breed group and size
const generateCharacteristics = (group: string, _size: string, _type: string) => {
  const baseCharacteristics = {
    energyLevel: 5,
    trainability: 5,
    friendliness: 5,
    groomingNeeds: 5,
    exerciseNeeds: 5,
    barking: 5,
    shedding: 5,
    goodWithKids: 5,
    goodWithDogs: 5,
    goodWithCats: 5,
    goodWithStrangers: 5,
    protective: 5,
    playful: 5,
    calm: 5,
    intelligent: 5,
    independent: 5,
    affectionate: 5,
    social: 5,
    confident: 5,
    gentle: 5,
    patient: 5,
    energetic: 5,
    loyal: 5,
    alert: 5,
    brave: 5,
    stubborn: 5,
    sensitive: 5,
    adaptable: 5,
    vocal: 5,
    territorial: 5,
  };

  // Adjust based on breed group
  switch (group.toLowerCase()) {
    case 'sporting':
      return { ...baseCharacteristics, energyLevel: 8, exerciseNeeds: 8, trainability: 8, friendly: 7 };
    case 'working':
      return { ...baseCharacteristics, energyLevel: 7, protective: 8, intelligent: 8, loyal: 9 };
    case 'herding':
      return { ...baseCharacteristics, energyLevel: 9, intelligent: 9, trainability: 9, alert: 8 };
    case 'hound':
      return { ...baseCharacteristics, independent: 7, vocal: 7, stubborn: 6, energyLevel: 6 };
    case 'terrier':
      return { ...baseCharacteristics, energyLevel: 8, stubborn: 7, vocal: 7, brave: 8 };
    case 'toy':
      return { ...baseCharacteristics, energyLevel: 4, goodWithKids: 6, barking: 7, shedding: 3 };
    default:
      return baseCharacteristics;
  }
};

// Generate physical traits
const generatePhysicalTraits = (size: string, group: string): string[] => {
  const traits = [];
  
  switch (size.toLowerCase()) {
    case 'toy':
      traits.push('Compact size', 'Lightweight', 'Portable');
      break;
    case 'small':
      traits.push('Small stature', 'Manageable size', 'Apartment-friendly');
      break;
    case 'medium':
      traits.push('Balanced proportions', 'Versatile size', 'Family-friendly');
      break;
    case 'large':
      traits.push('Substantial build', 'Strong presence', 'Athletic frame');
      break;
    case 'giant':
      traits.push('Impressive size', 'Powerful build', 'Commanding presence');
      break;
  }

  switch (group.toLowerCase()) {
    case 'sporting':
      traits.push('Athletic build', 'Water-resistant coat', 'Webbed feet');
      break;
    case 'working':
      traits.push('Strong build', 'Dense coat', 'Powerful jaws');
      break;
    case 'herding':
      traits.push('Agile build', 'Alert expression', 'Quick reflexes');
      break;
    case 'hound':
      traits.push('Sleek build', 'Long ears', 'Scenting ability');
      break;
    case 'terrier':
      traits.push('Compact build', 'Wire coat', 'Determined expression');
      break;
  }

  return traits;
};

// Generate temperament traits
const generateTemperament = (group: string, _type: string): string[] => {
  const baseTemperament = ['Loyal', 'Affectionate', 'Intelligent'];
  
  switch (group.toLowerCase()) {
    case 'sporting':
      return [...baseTemperament, 'Energetic', 'Friendly', 'Trainable'];
    case 'working':
      return [...baseTemperament, 'Protective', 'Confident', 'Alert'];
    case 'herding':
      return [...baseTemperament, 'Alert', 'Responsive', 'Energetic'];
    case 'hound':
      return [...baseTemperament, 'Independent', 'Gentle', 'Calm'];
    case 'terrier':
      return [...baseTemperament, 'Spirited', 'Bold', 'Playful'];
    case 'toy':
      return [...baseTemperament, 'Gentle', 'Playful', 'Companionable'];
    default:
      return baseTemperament;
  }
};

const transformBreed = async (item: BreedItem): Promise<TransformedBreed> => {
  const size = normalizeSize(item.size_category);
  const category = normalizeCategory(item.breed_group);
  const characteristics = generateCharacteristics(item.breed_group, item.size_category, item.breed_type);
  
  return {
    id: `breed-${item.id}`,
    name: item.name,
    altNames: item.alt_names || [],
    category,
    size,
    breedType: item.breed_type,
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
      `${item.breed_type === 'purebred' ? 'Purebred' : 'Hybrid'} breed with rich history`,
      `Part of the ${category} group`,
      `Size category: ${size}`,
      'Beloved by dog enthusiasts worldwide'
    ],
    breederCount: 0 // This would be calculated separately if needed
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
    const breedType = searchParams.get('breedType');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const sortBy = searchParams.get('sortBy') || 'name';

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
      const sizeMap: { [key: string]: string } = {
        'Toy': 'toy',
        'Small': 'small',
        'Medium': 'medium',
        'Large': 'large',
        'Giant': 'giant'
      };
      
      if (sizeMap[size]) {
        filterExpressions.push('#size_category = :size_category');
        expressionAttributeNames['#size_category'] = 'size_category';
        expressionAttributeValues[':size_category'] = sizeMap[size];
      }
    }

    // Breed type filter
    if (breedType && breedType !== 'All') {
      filterExpressions.push('#breed_type = :breed_type');
      expressionAttributeNames['#breed_type'] = 'breed_type';
      expressionAttributeValues[':breed_type'] = breedType.toLowerCase();
    }

    // Search filter
    if (search) {
      filterExpressions.push('(contains(#name, :search) OR contains(alt_names, :search) OR contains(search_terms, :search))');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search.toLowerCase();
    }

    // Apply filters
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    console.log('DynamoDB params:', JSON.stringify(params, null, 2));

    // Execute scan
    const result = await dynamodb.send(new ScanCommand(params));
    const items = result.Items as BreedItem[] || [];

    console.log(`Found ${items.length} breeds in DynamoDB`);

    // Transform all breeds
    const allTransformedBreeds = await Promise.all(
      items.map(item => transformBreed(item))
    );

    // Apply sorting
    const sortedBreeds = [...allTransformedBreeds];
    switch (sortBy) {
      case 'name':
        sortedBreeds.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'category':
        sortedBreeds.sort((a, b) => a.category.localeCompare(b.category) || a.name.localeCompare(b.name));
        break;
      case 'size':
        const sizeOrder = ['Toy', 'Small', 'Medium', 'Large', 'Giant'];
        sortedBreeds.sort((a, b) => {
          const aIndex = sizeOrder.indexOf(a.size);
          const bIndex = sizeOrder.indexOf(b.size);
          return aIndex - bIndex || a.name.localeCompare(b.name);
        });
        break;
      case 'breedType':
        sortedBreeds.sort((a, b) => a.breedType.localeCompare(b.breedType) || a.name.localeCompare(b.name));
        break;
    }

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBreeds = sortedBreeds.slice(startIndex, endIndex);
    const totalCount = sortedBreeds.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log(`Returning ${paginatedBreeds.length} breeds for page ${page} of ${totalPages}`);

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

