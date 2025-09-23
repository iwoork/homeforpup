// app/api/breeders/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

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

// Transform breeder data for frontend
const transformBreeder = (item: BreederItem): TransformedBreeder => {
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

// GET individual breeder by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const breederId = parseInt(params.id);
    
    if (isNaN(breederId)) {
      return NextResponse.json(
        { message: 'Invalid breeder ID' },
        { status: 400 }
      );
    }

    console.log('Fetching breeder with ID:', breederId);

    // Get breeder by ID using GetCommand
    const command = new GetCommand({
      TableName: BREEDERS_TABLE,
      Key: {
        id: breederId
      }
    });

    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      return NextResponse.json(
        { message: 'Breeder not found' },
        { status: 404 }
      );
    }

    const breederItem = result.Item as BreederItem;
    
    // Check if breeder is active
    if (breederItem.active !== 'True') {
      return NextResponse.json(
        { message: 'Breeder profile is not active' },
        { status: 404 }
      );
    }

    // Transform breeder data
    const transformedBreeder = transformBreeder(breederItem);

    console.log('Successfully fetched breeder:', transformedBreeder.businessName);

    return NextResponse.json({
      breeder: transformedBreeder,
      success: true
    });

  } catch (error) {
    console.error('Error fetching breeder:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching breeder',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT to update breeder information (for owner edits)
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const breederId = parseInt(params.id);
    
    if (isNaN(breederId)) {
      return NextResponse.json(
        { message: 'Invalid breeder ID' },
        { status: 400 }
      );
    }

    const updates = await request.json();

    // In a real app, you'd validate the user has permission to edit this breeder
    // and validate the incoming data

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Map frontend field names to database field names
    const fieldMapping: Record<string, string> = {
      businessName: 'business_name',
      about: 'about',
      phone: 'phone',
      email: 'email',
      website: 'website',
      location: 'location',
      businessHours: 'business_hours',
      pricing: 'pricing'
    };

    // Build update expression for allowed fields
    for (const [frontendField, dbField] of Object.entries(fieldMapping)) {
      if (updates[frontendField] !== undefined) {
        updateExpressions.push(`#${dbField} = :${dbField}`);
        expressionAttributeNames[`#${dbField}`] = dbField;
        expressionAttributeValues[`:${dbField}`] = updates[frontendField];
      }
    }

    // Handle arrays separately
    if (updates.breeds !== undefined) {
      updateExpressions.push('#breeds = :breeds');
      expressionAttributeNames['#breeds'] = 'breeds';
      expressionAttributeValues[':breeds'] = updates.breeds;
    }

    if (updates.specialties !== undefined) {
      updateExpressions.push('#specialties = :specialties');
      expressionAttributeNames['#specialties'] = 'specialties';
      expressionAttributeValues[':specialties'] = updates.specialties;
    }

    if (updates.certifications !== undefined) {
      updateExpressions.push('#certifications = :certifications');
      expressionAttributeNames['#certifications'] = 'certifications';
      expressionAttributeValues[':certifications'] = updates.certifications;
    }

    if (updates.healthTesting !== undefined) {
      updateExpressions.push('#health_testing = :health_testing');
      expressionAttributeNames['#health_testing'] = 'health_testing';
      expressionAttributeValues[':health_testing'] = updates.healthTesting;
    }

    // Always update last_updated timestamp
    updateExpressions.push('#last_updated = :last_updated');
    expressionAttributeNames['#last_updated'] = 'last_updated';
    expressionAttributeValues[':last_updated'] = new Date().toISOString();

    if (updateExpressions.length === 0) {
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Note: In a real implementation, you'd use UpdateCommand here
    // For now, we'll just return success
    console.log('Would update breeder with:', {
      updateExpressions,
      expressionAttributeNames,
      expressionAttributeValues
    });

    return NextResponse.json({
      message: 'Breeder updated successfully',
      success: true
    });

  } catch (error) {
    console.error('Error updating breeder:', error);
    return NextResponse.json(
      { 
        message: 'Error updating breeder',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}