// app/api/breeds/route.ts (for Next.js 13+ App Router)

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK v3 using your existing environment variables
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const TABLE_NAME = process.env.BREEDS_TABLE_NAME || 'homeforpup-breeds';

interface BreedItem {
  Breed: string;
  DogSize?: string;
  DogBreedGroup?: string;
  Height?: string;
  AvgHeightCm?: string;
  Weight?: string;
  AvgWeightKg?: string;
  LifeSpan?: string;
  AvgLifeSpanYears?: string;
  Adaptability?: string;
  Trainability?: string;
  PhysicalNeeds?: string;
  ImageUrls?: string[]; // Added ImageUrls array
}

interface TransformedBreed {
  id: string;
  name: string;
  category: string;
  size: string;
  image: string;
  images?: string[]; // Optional: include all images if needed
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
}

// Helper functions
const normalizeSize = (size?: string): string => {
  if (!size) return 'Medium';
  
  const sizeMap: { [key: string]: string } = {
    'toy': 'Small',
    'small': 'Small', 
    'medium': 'Medium',
    'large': 'Large',
    'extra large': 'Large',
    'giant': 'Large'
  };
  
  return sizeMap[size.toLowerCase()] || 'Medium';
};

const normalizeCategory = (group?: string): string => {
  if (!group) return 'Mixed';
  
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

const normalizeRating = (rating?: string): number => {
  if (!rating) return 5;
  
  const num = parseFloat(rating);
  if (isNaN(num)) return 5;
  
  if (num <= 1) return Math.round(num * 10);
  if (num <= 5) return Math.round(num * 2);
  return Math.min(Math.round(num), 10);
};

// Updated function to get image from ImageUrls array or fallback
const getBreedImage = (imageUrls?: string[], breedName?: string): string => {
  // If ImageUrls array exists and has images, use the first one
  if (imageUrls && imageUrls.length > 0) {
    // Filter out any invalid URLs (empty strings, null, undefined)
    const validUrls = imageUrls.filter(url => url && url.trim());
    if (validUrls.length > 0) {
      return validUrls[0];
    }
  }
  
  // Fallback to placeholder if no valid images
  return `https://placedog.net/500?r&id=${breedName || 'default'}`;
};

// Helper to get all valid images for a breed
const getBreedImages = (imageUrls?: string[]): string[] => {
  if (!imageUrls || imageUrls.length === 0) return [];
  
  // Filter out any invalid URLs
  return imageUrls.filter(url => url && url.trim());
};

const generateTemperament = (category: string, _size: string): string[] => {
  const temperamentMap: { [key: string]: string[] } = {
    'Sporting': ['Active', 'Friendly', 'Energetic', 'Loyal', 'Intelligent'],
    'Hound': ['Independent', 'Gentle', 'Determined', 'Friendly', 'Patient'],
    'Working': ['Confident', 'Strong', 'Loyal', 'Alert', 'Hardworking'],
    'Terrier': ['Bold', 'Energetic', 'Alert', 'Determined', 'Spirited'],
    'Toy': ['Affectionate', 'Alert', 'Companionable', 'Spirited', 'Gentle'],
    'Non-Sporting': ['Varied', 'Adaptable', 'Friendly', 'Intelligent', 'Calm'],
    'Herding': ['Intelligent', 'Alert', 'Responsive', 'Energetic', 'Loyal'],
    'Mixed': ['Friendly', 'Adaptable', 'Loyal', 'Gentle', 'Intelligent']
  };
  
  return temperamentMap[category] || temperamentMap['Mixed'];
};

const generateIdealFor = (size: string, category: string): string[] => {
  const baseIdeal = ['Dog lovers', 'Responsible owners'];
  
  if (size === 'Small') {
    baseIdeal.push('Apartment living', 'Seniors', 'Singles');
  } else if (size === 'Large') {
    baseIdeal.push('Active families', 'Houses with yards');
  } else {
    baseIdeal.push('Families', 'Various living situations');
  }
  
  if (category === 'Sporting' || category === 'Working') {
    baseIdeal.push('Active owners');
  }
  
  return baseIdeal.slice(0, 4);
};

const generateExerciseNeeds = (physicalNeeds: number): string => {
  if (physicalNeeds >= 8) return 'High - 60+ minutes daily';
  if (physicalNeeds >= 6) return 'Moderate to High - 45-60 minutes daily';
  if (physicalNeeds >= 4) return 'Moderate - 30-45 minutes daily';
  return 'Low to Moderate - 30 minutes daily';
};

const transformBreed = (item: BreedItem, index: number): TransformedBreed => {
  const breedName = item.Breed || 'Unknown Breed';
  const size = normalizeSize(item.DogSize);
  const category = normalizeCategory(item.DogBreedGroup);
  const validImages = getBreedImages(item.ImageUrls);
  
  return {
    id: `breed-${breedName.replace(/\s+/g, '-').toLowerCase()}-${index}`,
    name: breedName,
    category,
    size,
    image: getBreedImage(item.ImageUrls, breedName),
    images: validImages.length > 0 ? validImages : undefined, // Include all images if available
    overview: `A wonderful ${size.toLowerCase()} breed from the ${category} group, known for their unique characteristics and loyal companionship.`,
    characteristics: {
      energyLevel: normalizeRating(item.PhysicalNeeds),
      friendliness: Math.round(Math.random() * 3 + 7),
      trainability: normalizeRating(item.Trainability),
      groomingNeeds: Math.round(Math.random() * 4 + 4),
      goodWithKids: Math.round(Math.random() * 3 + 7),
      goodWithPets: Math.round(Math.random() * 4 + 6),
    },
    physicalTraits: {
      weight: item.Weight || item.AvgWeightKg ? `${item.AvgWeightKg || 'Unknown'} kg` : 'Unknown',
      height: item.Height || item.AvgHeightCm ? `${item.AvgHeightCm || 'Unknown'} cm` : 'Unknown', 
      lifespan: item.LifeSpan || item.AvgLifeSpanYears ? `${item.AvgLifeSpanYears || 'Unknown'} years` : 'Unknown',
      coat: 'Varies by breed'
    },
    temperament: generateTemperament(category, size),
    idealFor: generateIdealFor(size, category),
    exerciseNeeds: generateExerciseNeeds(normalizeRating(item.PhysicalNeeds)),
    commonHealthIssues: ['General breed health considerations', 'Regular vet checkups recommended'],
    groomingTips: `Regular grooming appropriate for ${size.toLowerCase()} breed coat type.`,
    trainingTips: `Training approach suited for ${category} group characteristics.`,
    funFacts: [
      `Part of the ${category} group`,
      `Typical size classification: ${size}`,
      `Adaptability rating: ${normalizeRating(item.Adaptability)}/10`
    ]
  };
};

interface ScanParams {
  TableName: string;
  FilterExpression?: string;
  ExpressionAttributeNames?: Record<string, string>;
  ExpressionAttributeValues?: Record<string, string>;
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    const size = searchParams.get('size');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');

    console.log('API Request params:', { search, category, size, page, limit });

    // First, get ALL data with minimal filtering (only apply DynamoDB-level filters that work well)
    const params: ScanParams = {
      TableName: TABLE_NAME,
    };

    // Only apply very basic DynamoDB filters that we know work well
    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, string> = {};

    // Only apply category filter at DynamoDB level if it's a direct match
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
        filterExpressions.push('contains(#group, :category)');
        expressionAttributeNames['#group'] = 'DogBreedGroup';
        expressionAttributeValues[':category'] = categoryMap[category];
      }
    }

    // Apply filters if any exist
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = expressionAttributeNames;
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    // Execute scan command to get all data
    const command = new ScanCommand(params);
    const result = await dynamodb.send(command);
    const items = (result.Items as BreedItem[]) || [];

    console.log('Raw DynamoDB results:', items.length);

    // Transform all the data first
    const allTransformedBreeds = items.map((item, index) => transformBreed(item, index));

    // Apply client-side filtering for better control
    let filteredBreeds = allTransformedBreeds;

    // Search filter - case insensitive breed name search
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredBreeds = filteredBreeds.filter(breed => 
        breed.name.toLowerCase().includes(searchLower)
      );
      console.log('After search filter:', filteredBreeds.length);
    }

    // Category filter
    if (category && category !== 'All') {
      filteredBreeds = filteredBreeds.filter(breed => 
        breed.category === category
      );
      console.log('After category filter:', filteredBreeds.length);
    }

    // Size filter
    if (size && size !== 'All') {
      filteredBreeds = filteredBreeds.filter(breed => {
        if (size === 'Medium' && breed.size === 'Medium to Large') return true;
        if (size === 'Large' && breed.size === 'Medium to Large') return true;
        return breed.size === size;
      });
      console.log('After size filter:', filteredBreeds.length);
    }

    // Sort for consistent pagination
    filteredBreeds.sort((a, b) => a.name.localeCompare(b.name));

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
      itemsOnPage: paginatedBreeds.length,
      startIndex,
      endIndex
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
      endIndex: Math.min(endIndex, totalCount)
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