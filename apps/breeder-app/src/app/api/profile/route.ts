import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { updateCognitoUserAttributes, CognitoUserAttributes } from '@/lib/cognito';

// Helper function to format phone number for Cognito (E.164 format)
function formatPhoneForCognito(phone: string, country?: {code: string, name: string, dialCode: string, flag: string} | null): string | null {
  if (!phone) return null;
  
  // Remove all non-digit characters
  const digitsOnly = phone.replace(/\D/g, '');
  
  // If we have a selected country, use its dial code
  if (country?.dialCode) {
    return country.dialCode + digitsOnly;
  }
  
  // Fallback logic for backward compatibility
  // If it's already in E.164 format (starts with country code), return as is
  if (digitsOnly.length >= 10 && digitsOnly.length <= 15) {
    return '+' + digitsOnly;
  }
  
  // If it's a US number without country code, add +1
  if (digitsOnly.length === 10) {
    return '+1' + digitsOnly;
  }
  
  // If it's a US number with leading 1, add +
  if (digitsOnly.length === 11 && digitsOnly.startsWith('1')) {
    return '+' + digitsOnly;
  }
  
  // If we can't format it properly, return null to skip Cognito update
  console.warn('⚠️ Cannot format phone number for Cognito:', phone);
  return null;
}

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
      // If user doesn't exist in database, return Cognito session data
      const cognitoUser = {
        userId: userId,
        email: session.user.email,
        name: session.user.name,
        firstName: session.user.firstName,
        lastName: session.user.lastName,
        phone: session.user.phone,
        location: session.user.location,
        bio: session.user.bio,
        profileImage: session.user.image,
        userType: session.user.userType || 'breeder',
        verified: session.user.isVerified || false,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      
      return NextResponse.json({ user: cognitoUser });
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
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
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

    console.log('✅ Profile saved to database successfully');

    // Sync profile changes to Cognito user attributes
    const cognitoAttributes: CognitoUserAttributes = {};
    
    if (body.name) cognitoAttributes.name = body.name;
    if (body.firstName) cognitoAttributes.given_name = body.firstName;
    if (body.lastName) cognitoAttributes.family_name = body.lastName;
    if (body.location) cognitoAttributes.address = body.location;
    if (body.bio) cognitoAttributes.profile = body.bio;
    
    // Format phone number for Cognito (E.164 format required)
    if (body.phone) {
      const formattedPhone = formatPhoneForCognito(body.phone, body.country);
      if (formattedPhone) {
        cognitoAttributes.phone_number = formattedPhone;
        console.log('📞 Formatted phone for Cognito:', formattedPhone);
      } else {
        console.warn('⚠️ Skipping phone number sync to Cognito due to invalid format');
      }
    }
    
    if (body.profileImage) cognitoAttributes.picture = body.profileImage;

    // Update Cognito attributes if any were provided
    if (Object.keys(cognitoAttributes).length > 0) {
      console.log('=== SYNCING TO COGNITO ===');
      const cognitoResult = await updateCognitoUserAttributes(userId, cognitoAttributes);
      
      if (!cognitoResult.success) {
        console.warn('⚠️ Failed to sync some attributes to Cognito:', cognitoResult.error);
        // Don't fail the entire request if Cognito sync fails
        // The database update was successful
      } else {
        console.log('✅ Profile synced to Cognito successfully');
      }
    }

    console.log('=== PROFILE UPDATE COMPLETE ===');

    return NextResponse.json({ 
      user: updatedUser,
      message: 'Profile updated successfully',
      cognitoSynced: Object.keys(cognitoAttributes).length > 0
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
