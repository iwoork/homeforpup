import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    // Get user session for authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const result = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: requestedUserId }
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    // Get user session for authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is updating their own profile
    if (userId !== requestedUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const timestamp = new Date().toISOString();

    // Get existing user data
    const existingUserResult = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: requestedUserId }
    }));

    if (!existingUserResult.Item) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const existingUser = existingUserResult.Item;

    // Update user data
    const updatedUser = {
      ...existingUser,
      ...body,
      userId: requestedUserId, // Ensure userId is not changed
      updatedAt: timestamp,
      lastActiveAt: timestamp
    };

    // Save updated user
    await dynamodb.send(new PutCommand({
      TableName: USERS_TABLE,
      Item: updatedUser
    }));

    return NextResponse.json({ 
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { 
        error: 'Failed to update user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}
