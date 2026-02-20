import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { auth, currentUser } from '@clerk/nextjs/server';

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
    removeUndefinedValues: true
  }
});

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

interface ProfileUpdateRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  country?: {code: string, name: string, dialCode: string, flag: string};
  location?: string;
  bio?: string;
  profileImage?: string;
  coverPhoto?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      showEmail?: boolean;
      showPhone?: boolean;
      showLocation?: boolean;
    };
  };
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
}

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    // Get user from database
    const result = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));

    if (!result.Item) {
      // If user doesn't exist in database, return Clerk user data
      const userProfile = {
        userId: userId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        name: clerkUser?.fullName || clerkUser?.firstName || '',
        firstName: clerkUser?.firstName || '',
        lastName: clerkUser?.lastName || '',
        phone: '',
        location: '',
        bio: '',
        profileImage: clerkUser?.imageUrl || '',
        userType: (clerkUser?.publicMetadata?.userType as string) || 'breeder',
        verified: false,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      return NextResponse.json({ user: userProfile });
    }

    return NextResponse.json({ user: result.Item });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body: ProfileUpdateRequest = await request.json();
    const timestamp = new Date().toISOString();

    console.log('=== PROFILE UPDATE START ===');
    console.log('User ID:', userId.substring(0, 10) + '...');
    console.log('Update data:', body);

    // Get existing user data
    const existingUserResult = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));

    if (!existingUserResult.Item) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingUser = existingUserResult.Item;

    // Update user data
    const updatedUser = {
      ...existingUser,
      ...body,
      userId: userId, // Ensure userId is not changed
      updatedAt: timestamp,
      lastActiveAt: timestamp
    };

    // Save updated user to database
    await dynamodb.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: updatedUser
    }));

    console.log('=== PROFILE UPDATE COMPLETE ===');

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
