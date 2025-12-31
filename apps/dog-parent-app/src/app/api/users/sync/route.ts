// src/app/api/users/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true // Remove undefined values automatically
  }
});

// Use profiles table if available, fallback to users table for backward compatibility
const USERS_TABLE = process.env.USERS_TABLE_NAME || process.env.PROFILES_TABLE_NAME || 'homeforpup-profiles';

// Log table name in development for debugging
if (process.env.NODE_ENV === 'development') {
  console.log('📊 Using DynamoDB table:', USERS_TABLE);
  console.log('   USERS_TABLE_NAME:', process.env.USERS_TABLE_NAME || 'not set');
  console.log('   PROFILES_TABLE_NAME:', process.env.PROFILES_TABLE_NAME || 'not set');
  console.log('   ⚠️  If you see ResourceNotFoundException, verify the table exists in AWS DynamoDB');
}

// Helper function to remove undefined values from objects
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefinedValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }
  
  return obj;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const decodedToken = {
      userId: (session.user as any).id,
      name: session.user.name || 'User',
      email: session.user.email || ''
    };
    
    console.log('Session verification successful for user sync:', decodedToken.userId.substring(0, 10) + '...');

    const body = await request.json();
    const { 
      userType = 'dog-parent',
      phone,
      location,
      bio,
      profileImage,
      coverPhoto,
      galleryPhotos,
      preferences,
      breederInfo,
      adopterInfo 
    } = body;

    const { userId, name, email } = decodedToken;
    const timestamp = new Date().toISOString();

    // Check if user already exists
    const existingUserResult = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));

    const existingUser = existingUserResult.Item;
    const isNewUser = !existingUser;

    // Prepare user data with comprehensive fields
    const rawUserData = {
      userId: userId,
      email: email,
      name: name || email?.split('@')[0] || 'User',
      firstName: name?.split(' ')[0] || undefined,
      lastName: name?.split(' ').slice(1).join(' ') || undefined,
      displayName: existingUser?.displayName || name || email?.split('@')[0] || 'User',
      userType: existingUser?.userType || userType,
      phone: phone || existingUser?.phone || undefined,
      location: location || existingUser?.location || undefined,
      bio: bio || existingUser?.bio || undefined,
      profileImage: profileImage || existingUser?.profileImage || undefined,
      coverPhoto: coverPhoto || existingUser?.coverPhoto || undefined,
      galleryPhotos: galleryPhotos || existingUser?.galleryPhotos || [],
      verified: true, // User came from Cognito, so email is verified
      accountStatus: existingUser?.accountStatus || 'active',
      
      // Merge preferences
      preferences: removeUndefinedValues({
        notifications: {
          email: true,
          sms: false,
          push: true,
          ...existingUser?.preferences?.notifications,
          ...preferences?.notifications
        },
        privacy: {
          showEmail: false,
          showPhone: true,
          showLocation: true,
          ...existingUser?.preferences?.privacy,
          ...preferences?.privacy
        }
      }),

      // Handle breeder-specific info
      breederInfo: userType === 'breeder' || userType === 'both' ? removeUndefinedValues({
        kennelName: breederInfo?.kennelName || existingUser?.breederInfo?.kennelName || undefined,
        license: breederInfo?.license || existingUser?.breederInfo?.license || undefined,
        specialties: breederInfo?.specialties || existingUser?.breederInfo?.specialties || [],
        experience: breederInfo?.experience || existingUser?.breederInfo?.experience || 0,
        website: breederInfo?.website || existingUser?.breederInfo?.website || undefined,
        ...existingUser?.breederInfo,
        ...breederInfo
      }) : existingUser?.breederInfo,

      // Handle dog parent-specific info  
      adopterInfo: userType === 'dog-parent' || userType === 'both' ? removeUndefinedValues({
        housingType: adopterInfo?.housingType || existingUser?.adopterInfo?.housingType || undefined,
        yardSize: adopterInfo?.yardSize || existingUser?.adopterInfo?.yardSize || undefined,
        hasOtherPets: adopterInfo?.hasOtherPets || existingUser?.adopterInfo?.hasOtherPets || false,
        experienceLevel: adopterInfo?.experienceLevel || existingUser?.adopterInfo?.experienceLevel || 'first-time',
        preferredBreeds: adopterInfo?.preferredBreeds || existingUser?.adopterInfo?.preferredBreeds || [],
        ...existingUser?.adopterInfo,
        ...adopterInfo
      }) : existingUser?.adopterInfo,

      // Timestamps
      createdAt: existingUser?.createdAt || timestamp,
      updatedAt: timestamp,
      lastActiveAt: timestamp
    };

    // Clean all undefined values from the user data
    const userData = removeUndefinedValues(rawUserData);

    // Create or update user record
    await dynamodb.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: userData
    }));

    console.log(`User ${isNewUser ? 'created' : 'updated'} successfully:`, {
      userId: userId.substring(0, 10) + '...',
      email: email,
      name: userData.name,
      userType: userData.userType,
      isNewUser
    });

    return NextResponse.json({ 
      user: userData,
      isNewUser,
      message: `User ${isNewUser ? 'created' : 'updated'} successfully`
    }, { status: isNewUser ? 201 : 200 });

  } catch (error: any) {
    console.error('Error syncing user:', error);
    
    // Check if it's a ResourceNotFoundException (table doesn't exist)
    if (error.name === 'ResourceNotFoundException' || error.message?.includes('ResourceNotFoundException')) {
      console.error('❌ DynamoDB table not found:', USERS_TABLE);
      console.error('   Please verify:');
      console.error('   1. Table exists in AWS DynamoDB:', USERS_TABLE);
      console.error('   2. AWS credentials have access to the table');
      console.error('   3. AWS_REGION is set correctly:', process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1');
      console.error('   4. Table name environment variable is set correctly');
      
      return NextResponse.json(
        { 
          error: 'Failed to sync user data',
          details: `DynamoDB table '${USERS_TABLE}' not found. Please verify the table exists and AWS credentials are configured correctly.`,
          tableName: USERS_TABLE,
          troubleshooting: [
            `1. Verify table '${USERS_TABLE}' exists in AWS DynamoDB Console`,
            '2. Check AWS credentials (AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY)',
            '3. Verify AWS_REGION matches the table region',
            '4. Ensure IAM permissions allow DynamoDB access',
            '5. If table was migrated, set PROFILES_TABLE_NAME environment variable'
          ]
        }, 
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to sync user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current user data
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Get user from database
    const result = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));

    if (!result.Item) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result.Item });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}