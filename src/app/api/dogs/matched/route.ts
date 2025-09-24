// app/api/dogs/matched/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/lib';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const DOGS_TABLE_NAME = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const USERS_TABLE_NAME = process.env.USERS_TABLE_NAME || 'homeforpup-users';

// Helper function to calculate puppy age in months
function calculateAgeInMonths(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - birth.getTime());
  const diffMonths = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 30.44)); // Average days per month
  return diffMonths;
}

// Helper function to check if puppy matches user criteria
function matchesUserCriteria(puppy: any, userCriteria: any): boolean {
  // Must be available
  if (puppy.breedingStatus !== 'available') {
    return false;
  }

  // Check preferred breeds
  if (userCriteria.preferredBreeds && userCriteria.preferredBreeds.length > 0) {
    if (!userCriteria.preferredBreeds.includes(puppy.breed)) {
      return false;
    }
  }

  // Check experience level vs puppy needs
  if (userCriteria.experienceLevel) {
    const puppyAge = calculateAgeInMonths(puppy.birthDate);
    
    // First-time owners should get older, more settled puppies (6+ months)
    if (userCriteria.experienceLevel === 'first-time' && puppyAge < 6) {
      return false;
    }
    
    // Experienced owners can handle younger puppies
    // Some experience can handle 3+ months
    if (userCriteria.experienceLevel === 'some' && puppyAge < 3) {
      return false;
    }
  }

  // Check housing type compatibility
  if (userCriteria.housingType) {
    // Apartment/condo owners should get smaller, less energetic breeds
    if (userCriteria.housingType === 'apartment' || userCriteria.housingType === 'condo') {
      const highEnergyBreeds = [
        'Border Collie', 'Australian Shepherd', 'Jack Russell Terrier', 
        'Siberian Husky', 'German Shepherd', 'Labrador Retriever',
        'Golden Retriever', 'Belgian Malinois', 'Weimaraner'
      ];
      
      if (highEnergyBreeds.includes(puppy.breed)) {
        return false;
      }
    }
  }

  // Check if user has other pets (some breeds are better with other pets)
  if (userCriteria.hasOtherPets !== undefined) {
    // If user has other pets, avoid breeds known to be less social
    if (userCriteria.hasOtherPets) {
      const lessSocialBreeds = [
        'Akita', 'Chow Chow', 'Shiba Inu', 'Basenji'
      ];
      
      if (lessSocialBreeds.includes(puppy.breed)) {
        return false;
      }
    }
  }

  // Check yard size requirements
  if (userCriteria.yardSize) {
    const largeBreedNeeds = [
      'Great Dane', 'Mastiff', 'Saint Bernard', 'Newfoundland',
      'Bernese Mountain Dog', 'German Shepherd', 'Labrador Retriever'
    ];
    
    if (largeBreedNeeds.includes(puppy.breed) && userCriteria.yardSize === 'none') {
      return false;
    }
  }

  return true;
}

export async function GET(request: NextRequest) {
  try {
    // Get and verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No authorization token provided' }, { status: 401 });
    }

    const { userId } = await verifyJWT(token);
    if (!userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    // Get user's profile to access their search criteria
    const userResult = await docClient.send(new QueryCommand({
      TableName: USERS_TABLE_NAME,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      }
    }));

    if (!userResult.Items || userResult.Items.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = userResult.Items[0];
    const userCriteria = user.adopterInfo || {};

    // If user hasn't set any criteria, return empty array
    if (!userCriteria.preferredBreeds || userCriteria.preferredBreeds.length === 0) {
      return NextResponse.json({ matchedPuppies: [] });
    }

    // Get all available dogs
    const dogsResult = await docClient.send(new ScanCommand({
      TableName: DOGS_TABLE_NAME,
      FilterExpression: 'breedingStatus = :status',
      ExpressionAttributeValues: {
        ':status': 'available'
      }
    }));

    if (!dogsResult.Items) {
      return NextResponse.json({ matchedPuppies: [] });
    }

    // Filter dogs based on user criteria
    const matchedPuppies = dogsResult.Items.filter((puppy: any) => 
      matchesUserCriteria(puppy, userCriteria)
    );

    // Sort by most recent first
    matchedPuppies.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return NextResponse.json(matchedPuppies);

  } catch (error) {
    console.error('Error fetching matched puppies:', error);
    return NextResponse.json(
      { error: 'Failed to fetch matched puppies' },
      { status: 500 }
    );
  }
}
