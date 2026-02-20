import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

// POST - Increment profile views
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const profileUserId = params.id;

    if (!profileUserId || typeof profileUserId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current user
    const { userId: currentUserId } = await auth();

    // Don't count views from the profile owner
    if (currentUserId === profileUserId) {
      return NextResponse.json({
        message: 'Profile view not counted for own profile',
        success: true
      });
    }

    console.log('Incrementing profile views for user:', profileUserId.substring(0, 10) + '...');

    // First, get the user to check if they exist
    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: profileUserId }
    });

    const getResult = await dynamodb.send(getCommand);
    
    if (!getResult.Item) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (getResult.Item.accountStatus !== 'active') {
      return NextResponse.json(
        { message: 'User profile is not available' },
        { status: 404 }
      );
    }

    // Increment profile views using atomic counter
    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId: profileUserId },
      UpdateExpression: 'SET profileViews = if_not_exists(profileViews, :zero) + :inc, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':zero': 0,
        ':inc': 1,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'UPDATED_NEW'
    });

    const result = await dynamodb.send(updateCommand);
    
    const newViewCount = result.Attributes?.profileViews || 0;

    console.log('Successfully incremented profile views. New count:', newViewCount);

    return NextResponse.json({
      message: 'Profile view recorded',
      profileViews: newViewCount,
      success: true
    });

  } catch (error) {
    console.error('Error incrementing profile views:', error);
    return NextResponse.json(
      { 
        message: 'Error recording profile view',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET - Get current profile view count
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

    const getCommand = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
      ProjectionExpression: 'profileViews'
    });

    const result = await dynamodb.send(getCommand);
    
    if (!result.Item) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profileViews: result.Item.profileViews || 0,
      success: true
    });

  } catch (error) {
    console.error('Error getting profile views:', error);
    return NextResponse.json(
      { 
        message: 'Error getting profile views',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
