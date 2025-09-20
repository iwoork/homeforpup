// app/api/breeders/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const BREEDERS_TABLE = process.env.BREEDERS_TABLE_NAME || 'homeforpup-breeders';

// Breeder interface matching Python script data model
interface BreederItem {
  id: number;
  name: string;
  business_name: string;
  location: string;
  state: string;
  city: string;
  zip_code: string;
  country: string;
  latitude?: number;
  longitude?: number;
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breed_ids: number[];
  rating: number;
  review_count: number;
  verified: string; // DynamoDB stores as string for GSI
  profile_image: string;
  cover_image: string;
  about: string;
  certifications: string[];
  health_testing: string[];
  specialties: string[];
  current_litters: number;
  available_puppies: number;
  pricing: string;
  shipping: boolean;
  pickup_available: boolean;
  established_year?: number;
  business_hours: string;
  appointment_required: boolean;
  social_media: Record<string, string>;
  tags: string[];
  active: string; // DynamoDB stores as string for GSI
  last_updated: string;
  total_reviews: number;
  response_rate: number;
  avg_response_time: string;
}

// Transformed breeder interface for frontend
interface TransformedBreeder {
  id: number;
  name: string;
  businessName: string;
  location: string;
  state: string;
  city: string;
  zipCode: string;
  coordinates?: {
    latitude: number;
    longitude: number;
  };
  distance?: number; // Will be calculated if user location provided
  phone: string;
  email: string;
  website: string;
  experience: number;
  breeds: string[];
  breedIds: number[];
  rating: number;
  reviewCount: number;
  verified: boolean;
  profileImage: string;
  coverImage: string;
  about: string;
  certifications: string[];
  healthTesting: string[];
  specialties: string[];
  currentLitters: number;
  availablePuppies: number;
  pricing: string;
  shipping: boolean;
  pickupAvailable: boolean;
  establishedYear?: number;
  businessHours: string;
  appointmentRequired: boolean;
  socialMedia: Record<string, string>;
  tags: string[];
  responseRate: number;
  avgResponseTime: string;
  lastUpdated: string;
}

// Calculate distance between two coordinates (Haversine formula)
const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
};

// Transform breeder data for frontend
const transformBreeder = (item: BreederItem, userLat?: number, userLon?: number): TransformedBreeder => {
  let distance: number | undefined;
  
  // Calculate distance if user location and breeder coordinates are available
  if (userLat && userLon && item.latitude && item.longitude) {
    distance = calculateDistance(userLat, userLon, item.latitude, item.longitude);
  }

  return {
    id: item.id,
    name: item.name,
    businessName: item.business_name,
    location: item.location,
    state: item.state,
    city: item.city,
    zipCode: item.zip_code,
    coordinates: item.latitude && item.longitude ? {
      latitude: item.latitude,
      longitude: item.longitude
    } : undefined,
    distance,
    phone: item.phone,
    email: item.email,
    website: item.website,
    experience: item.experience,
    breeds: item.breeds,
    breedIds: item.breed_ids,
    rating: item.rating,
    reviewCount: item.review_count,
    verified: item.verified === 'True',
    profileImage: item.profile_image,
    coverImage: item.cover_image,
    about: item.about,
    certifications: item.certifications,
    healthTesting: item.health_testing,
    specialties: item.specialties,
    currentLitters: item.current_litters,
    availablePuppies: item.available_puppies,
    pricing: item.pricing,
    shipping: item.shipping,
    pickupAvailable: item.pickup_available,
    establishedYear: item.established_year,
    businessHours: item.business_hours,
    appointmentRequired: item.appointment_required,
    socialMedia: item.social_media,
    tags: item.tags,
    responseRate: item.response_rate,
    avgResponseTime: item.avg_response_time,
    lastUpdated: item.last_updated
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
    
    // Search and filter parameters
    const search = searchParams.get('search');
    const breed = searchParams.get('breed');
    const state = searchParams.get('state');
    const verified = searchParams.get('verified') === 'true';
    const shipping = searchParams.get('shipping') === 'true';
    const availablePuppies = searchParams.get('availablePuppies') === 'true';
    const minRating = parseFloat(searchParams.get('minRating') || '0');
    const minExperience = parseInt(searchParams.get('minExperience') || '0');
    const maxExperience = parseInt(searchParams.get('maxExperience') || '50');
    
    // Pagination
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    
    // Sorting
    const sortBy = searchParams.get('sortBy') || 'rating'; // rating, experience, distance, reviews
    
    // User location for distance calculation
    const userLat = searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : undefined;
    const userLon = searchParams.get('userLon') ? parseFloat(searchParams.get('userLon')!) : undefined;

    console.log('Breeders API Request params:', { 
      search, breed, state, verified, shipping, availablePuppies, 
      minRating, minExperience, maxExperience, page, limit, sortBy 
    });

    // Build DynamoDB query parameters
    const params: ScanParams = {
      TableName: BREEDERS_TABLE,
    };

    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Only show active breeders
    filterExpressions.push('#active = :active');
    expressionAttributeNames['#active'] = 'active';
    expressionAttributeValues[':active'] = 'True';

    // State filter using GSI if available
    if (state) {
      filterExpressions.push('#state = :state');
      expressionAttributeNames['#state'] = 'state';
      expressionAttributeValues[':state'] = state;
    }

    // Verified filter
    if (verified) {
      filterExpressions.push('#verified = :verified');
      expressionAttributeNames['#verified'] = 'verified';
      expressionAttributeValues[':verified'] = 'True';
    }

    // Shipping filter
    if (shipping) {
      filterExpressions.push('#shipping = :shipping');
      expressionAttributeNames['#shipping'] = 'shipping';
      expressionAttributeValues[':shipping'] = true;
    }

    // Available puppies filter
    if (availablePuppies) {
      filterExpressions.push('#available_puppies > :zero');
      expressionAttributeNames['#available_puppies'] = 'available_puppies';
      expressionAttributeValues[':zero'] = 0;
    }

    // Rating filter
    if (minRating > 0) {
      filterExpressions.push('#rating >= :minRating');
      expressionAttributeNames['#rating'] = 'rating';
      expressionAttributeValues[':minRating'] = minRating;
    }

    // Experience filter
    if (minExperience > 0) {
      filterExpressions.push('#experience >= :minExperience');
      expressionAttributeNames['#experience'] = 'experience';
      expressionAttributeValues[':minExperience'] = minExperience;
    }

    if (maxExperience < 50) {
      filterExpressions.push('#experience <= :maxExperience');
      expressionAttributeNames['#experience'] = 'experience';
      expressionAttributeValues[':maxExperience'] = maxExperience;
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
    const items = (result.Items as BreederItem[]) || [];

    console.log('Raw DynamoDB breeders results:', items.length);

    // Transform all breeders
    const allTransformedBreeders = items.map(item => transformBreeder(item, userLat, userLon));

    // Apply client-side filters that are complex for DynamoDB
    let filteredBreeders = allTransformedBreeders;

    // Search filter - search across multiple fields
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      filteredBreeders = filteredBreeders.filter(breeder => 
        breeder.businessName.toLowerCase().includes(searchLower) ||
        breeder.name.toLowerCase().includes(searchLower) ||
        breeder.breeds.some(breed => breed.toLowerCase().includes(searchLower)) ||
        breeder.city.toLowerCase().includes(searchLower) ||
        breeder.specialties.some(specialty => specialty.toLowerCase().includes(searchLower)) ||
        breeder.tags.some(tag => tag.toLowerCase().includes(searchLower))
      );
      console.log('After search filter:', filteredBreeders.length);
    }

    // Breed filter - check if breeder works with specific breed
    if (breed && breed.trim()) {
      filteredBreeders = filteredBreeders.filter(breeder => 
        breeder.breeds.some(b => b.toLowerCase().includes(breed.toLowerCase()))
      );
      console.log('After breed filter:', filteredBreeders.length);
    }

    // Sorting
    filteredBreeders.sort((a, b) => {
      switch (sortBy) {
        case 'rating':
          return b.rating - a.rating;
        case 'experience':
          return b.experience - a.experience;
        case 'distance':
          if (a.distance !== undefined && b.distance !== undefined) {
            return a.distance - b.distance;
          }
          return 0;
        case 'reviews':
          return b.reviewCount - a.reviewCount;
        case 'availability':
          return b.availablePuppies - a.availablePuppies;
        case 'name':
          return a.businessName.localeCompare(b.businessName);
        default:
          return b.rating - a.rating;
      }
    });

    // Apply pagination
    const totalCount = filteredBreeders.length;
    const totalPages = Math.ceil(totalCount / limit);
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedBreeders = filteredBreeders.slice(startIndex, endIndex);

    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    console.log('Final breeders pagination:', { 
      totalCount, 
      totalPages, 
      currentPage: page, 
      itemsOnPage: paginatedBreeders.length 
    });

    // Extract filter options from all breeders for frontend
    const availableStates = [...new Set(allTransformedBreeders.map(b => b.state))].sort();
    const availableBreeds = [...new Set(allTransformedBreeders.flatMap(b => b.breeds))].sort();
    const availableCertifications = [...new Set(allTransformedBreeders.flatMap(b => b.certifications))].sort();
    const availableSpecialties = [...new Set(allTransformedBreeders.flatMap(b => b.specialties))].sort();

    return NextResponse.json({
      breeders: paginatedBreeders,
      count: paginatedBreeders.length,
      total: totalCount,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      filters: {
        availableStates,
        availableBreeds,
        availableCertifications,
        availableSpecialties,
        averageRating: allTransformedBreeders.reduce((sum, b) => sum + b.rating, 0) / allTransformedBreeders.length,
        totalAvailablePuppies: allTransformedBreeders.reduce((sum, b) => sum + b.availablePuppies, 0),
        verifiedCount: allTransformedBreeders.filter(b => b.verified).length
      },
      stats: {
        averageExperience: Math.round(allTransformedBreeders.reduce((sum, b) => sum + b.experience, 0) / allTransformedBreeders.length),
        verifiedPercentage: Math.round((allTransformedBreeders.filter(b => b.verified).length / allTransformedBreeders.length) * 100),
        shippingAvailable: allTransformedBreeders.filter(b => b.shipping).length,
        withAvailablePuppies: allTransformedBreeders.filter(b => b.availablePuppies > 0).length
      }
    });

  } catch (error) {
    console.error('Error fetching breeders:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching breeders',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}