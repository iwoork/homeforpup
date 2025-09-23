// app/api/users/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWTEnhanced } from '@/utils/enhanced-auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'puppy-platform-dev-users';

// User interface matching the database structure
interface UserItem {
  userId: string;
  name: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  profileImage?: string;
  verified: boolean;
  userType: 'adopter' | 'breeder' | 'both';
  accountStatus: 'active' | 'inactive' | 'pending';
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

// Helper function to sanitize user data based on privacy settings
const sanitizeUserData = (user: UserItem, isOwnProfile: boolean = false): UserItem => {
  // If it's the user's own profile, return all data
  if (isOwnProfile) {
    return user;
  }

  // Apply privacy settings for other users viewing the profile
  const sanitized = { ...user };

  // Hide email if privacy setting is false
  if (!user.preferences?.privacy?.showEmail) {
    delete sanitized.email;
  }

  // Hide phone if privacy setting is false
  if (!user.preferences?.privacy?.showPhone) {
    delete sanitized.phone;
  }

  // Hide location if privacy setting is false
  if (!user.preferences?.privacy?.showLocation) {
    delete sanitized.location;
  }

  // Always hide sensitive internal data from public view
  delete sanitized.accountStatus;

  return sanitized;
};

// GET user profile by ID
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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

    // Optional: Get current user from token to check if viewing own profile
    let currentUserId: string | null = null;
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (token) {
      try {
        const decoded = await verifyJWTEnhanced(token);
        currentUserId = decoded.userId;
      } catch (verificationError) {
        // Token is invalid, but we can still show public profile
        console.log('Invalid token provided, showing public profile only');
      }
    }

    // Get user by ID using GetCommand
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: {
        userId: userId
      }
    });

    const result = await dynamodb.send(command);
    
    if (!result.Item) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    const userItem = result.Item as UserItem;
    
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

// PUT to update user profile
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
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
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let currentUserId: string;
    try {
      const decoded = await verifyJWTEnhanced(token);
      currentUserId = decoded.userId;
    } catch (verificationError) {
      return NextResponse.json({ 
        error: 'Invalid authentication token',
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

    const updates = await request.json();

    // Build update expression for allowed fields
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Define allowed fields that users can update
    const allowedFields = [
      'displayName',
      'phone',
      'location',
      'bio',
      'profileImage'
    ];

    // Handle simple field updates
    for (const field of allowedFields) {
      if (updates[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = updates[field];
      }
    }

    // Handle nested object updates
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

    console.log('User profile updated successfully:', userId.substring(0, 10) + '...');

    return NextResponse.json({
      user: result.Attributes,
      message: 'Profile updated successfully',
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