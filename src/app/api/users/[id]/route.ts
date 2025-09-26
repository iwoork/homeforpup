// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWTEnhanced } from '../../../../lib/utils/enhanced-auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

// Base user interface for database storage (all required fields)
interface DatabaseUserItem {
  userId: string;
  name: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string; // Required in database
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  coverPhoto?: string;
  galleryPhotos?: string[];
  verified: boolean;
  userType: 'adopter' | 'breeder' | 'both';
  accountStatus: 'active' | 'inactive' | 'pending'; // Required in database
  preferences: {
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    privacy: {
      showEmail: boolean;
      showPhone: boolean;
      showLocation: boolean;
    };
  };
  adopterInfo?: {
    housingType?: 'house' | 'apartment' | 'condo' | 'townhouse' | 'farm';
    yardSize?: 'none' | 'small' | 'medium' | 'large' | 'acreage';
    hasOtherPets: boolean;
    experienceLevel: 'first-time' | 'some-experience' | 'very-experienced';
    preferredBreeds: string[];
    agePreference?: 'puppy' | 'young' | 'adult' | 'senior' | 'any';
    sizePreference?: 'toy' | 'small' | 'medium' | 'large' | 'giant' | 'any';
    activityLevel?: 'low' | 'moderate' | 'high' | 'very-high';
    familySituation?: string;
    workSchedule?: string;
    previousPets?: string[];
    dealBreakers?: string[];
    specialRequirements?: string[];
  };
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties: string[];
    experience: number;
    website?: string;
  };
  createdAt: string;
  updatedAt: string;
  lastActiveAt: string;
}

// Public interface for sanitized user data (privacy-sensitive fields are optional)
interface PublicUserItem extends Omit<DatabaseUserItem, 'email' | 'phone' | 'location' | 'accountStatus'> {
  email?: string;
  phone?: string;
  location?: string;
  // accountStatus is completely omitted from public view
}

// Full profile interface for own profile view (alias for clarity)
type PrivateUserItem = DatabaseUserItem;

// Union type for API responses
type UserProfileResponse = PublicUserItem | PrivateUserItem;

// Type-safe sanitization function
const sanitizeUserData = (user: DatabaseUserItem, isOwnProfile: boolean): UserProfileResponse => {
  if (isOwnProfile) {
    // Return full profile for own profile
    return user as PrivateUserItem;
  }

  // Create public profile by omitting sensitive fields and selectively including privacy-controlled fields
  const { email, phone, location, ...basePublicFields } = user;
  
  // Build public profile (accountStatus is implicitly excluded by not being in basePublicFields)
  const publicProfile: PublicUserItem = {
    ...basePublicFields
  };

  // Conditionally add privacy-controlled fields
  if (user.preferences?.privacy?.showEmail) {
    publicProfile.email = email;
  }

  if (user.preferences?.privacy?.showPhone && phone) {
    publicProfile.phone = phone;
  }

  if (user.preferences?.privacy?.showLocation && location) {
    publicProfile.location = location;
  }

  return publicProfile;
};

// API Response interface
interface UserProfileAPIResponse {
  user: UserProfileResponse;
  isOwnProfile: boolean;
  success: true;
}

interface ErrorAPIResponse {
  message: string;
  error?: string;
  details?: string;
  success?: never;
}

type APIResponse = UserProfileAPIResponse | ErrorAPIResponse;

// GET user profile by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse>> {
  try {
    const params = await context.params;
    const userId = params.id;
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    console.log('Fetching user profile for ID:', userId.substring(0, 10) + '...');

    // Get current user from token to check if viewing own profile
    let currentUserId: string | null = null;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = await verifyJWTEnhanced(token);
        currentUserId = decoded.userId;
      } catch (verificationError) {
        console.error(verificationError);
        console.log('Invalid token provided, showing public profile only');
      }
    }

    // Get user by ID using GetCommand
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId }
    });

    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Type assertion with runtime validation
    const userItem = result.Item as DatabaseUserItem;
    
    console.log('User data from database:', {
      userId: userItem.userId,
      userType: userItem.userType,
      name: userItem.name
    });
    
    // Also log the full user item to see what's actually in the database
    console.log('Full user item from database:', JSON.stringify(userItem, null, 2));
    
    // Validate required fields exist
    if (!userItem.userId || !userItem.email || !userItem.accountStatus) {
      console.error('Invalid user data structure:', userItem);
      return NextResponse.json(
        { message: 'Invalid user data' },
        { status: 500 }
      );
    }
    
    // Check if user is active
    if (userItem.accountStatus !== 'active') {
      return NextResponse.json(
        { message: 'User profile is not available' },
        { status: 404 }
      );
    }

    // Check if this is the user's own profile
    const isOwnProfile = currentUserId === userId;

    // Sanitize user data based on privacy settings
    const sanitizedUser = sanitizeUserData(userItem, isOwnProfile);

    console.log('Successfully fetched user profile:', userItem.displayName || userItem.name);

    return NextResponse.json({
      user: sanitizedUser,
      isOwnProfile,
      success: true
    });

  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching user profile',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// Interface for update requests
interface UserUpdateRequest {
  displayName?: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  coverPhoto?: string;
  galleryPhotos?: string[];
  preferences?: DatabaseUserItem['preferences'];
  adopterInfo?: DatabaseUserItem['adopterInfo'];
  breederInfo?: DatabaseUserItem['breederInfo'];
}

// PUT to update user profile
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse<APIResponse>> {
  try {
    const params = await context.params;
    const userId = params.id;
    
    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Verify JWT token for authentication
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    let currentUserId: string;
    try {
      const decoded = await verifyJWTEnhanced(token);
      currentUserId = decoded.userId;
    } catch (verificationError) {
      return NextResponse.json({ 
        message: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }

    // Check if user is updating their own profile
    if (currentUserId !== userId) {
      return NextResponse.json(
        { message: 'Not authorized to update this profile' },
        { status: 403 }
      );
    }

    const updates: UserUpdateRequest = await request.json();

    // Build update expression for allowed fields
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {};

    // Define allowed fields that users can update (type-safe)
    const allowedFields: (keyof UserUpdateRequest)[] = [
      'displayName',
      'phone',
      'location',
      'bio',
      'profileImage',
      'coverPhoto',
      'galleryPhotos'
    ];

    // Handle simple field updates with type safety
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = updates[field];
      }
    }

    // Handle nested object updates with proper typing
    if (updates.preferences) {
      updateExpressions.push('#preferences = :preferences');
      expressionAttributeNames['#preferences'] = 'preferences';
      expressionAttributeValues[':preferences'] = updates.preferences;
    }

    if (updates.adopterInfo) {
      updateExpressions.push('#adopterInfo = :adopterInfo');
      expressionAttributeNames['#adopterInfo'] = 'adopterInfo';
      expressionAttributeValues[':adopterInfo'] = updates.adopterInfo;
    }

    if (updates.breederInfo) {
      updateExpressions.push('#breederInfo = :breederInfo');
      expressionAttributeNames['#breederInfo'] = 'breederInfo';
      expressionAttributeValues[':breederInfo'] = updates.breederInfo;
    }

    // Always update timestamp
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    if (updateExpressions.length === 1) { // Only timestamp was added
      return NextResponse.json(
        { message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    // Execute update
    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    });

    const result = await dynamodb.send(updateCommand);

    if (!result.Attributes) {
      return NextResponse.json(
        { message: 'Update failed' },
        { status: 500 }
      );
    }

    console.log('User profile updated successfully:', userId.substring(0, 10) + '...');

    // Return the updated user data (user's own profile, so return all data)
    const updatedUser = result.Attributes as DatabaseUserItem;
    const sanitizedUser = sanitizeUserData(updatedUser, true); // Always own profile for updates

    return NextResponse.json({
      user: sanitizedUser,
      isOwnProfile: true,
      success: true
    });

  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json(
      { 
        message: 'Error updating user profile',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}