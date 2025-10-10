import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const USERS_TABLE = 'homeforpup-users';

// PUT /api/users/[id]/userType - Update user type
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.id;
    console.log('UserType update API called for userId:', userId);

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const sessionUserId = session.user.id;
    console.log('Session userId:', sessionUserId);
    
    // Only allow users to update their own userType
    if (userId !== sessionUserId) {
      console.log('Unauthorized: userId mismatch', { userId, sessionUserId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userType } = body;
    console.log('Request body:', body);

    if (!userType || !['breeder', 'dog-parent', 'both'].includes(userType)) {
      console.log('Invalid userType:', userType);
      return NextResponse.json({ error: 'Invalid userType. Must be breeder, adopter, or both' }, { status: 400 });
    }

    // First, get the existing user to verify they exist
    const getParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: userId,
      },
    };

    const existingUser = await docClient.send(new GetCommand(getParams));
    console.log('Existing user:', existingUser.Item);
    if (!existingUser.Item) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the userType
    const updateParams = {
      TableName: USERS_TABLE,
      Key: {
        userId: userId,
      },
      UpdateExpression: 'SET userType = :userType, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':userType': userType,
        ':updatedAt': new Date().toISOString(),
      },
      ReturnValues: 'ALL_NEW' as const,
    };

    console.log('Update params:', updateParams);
    const result = await docClient.send(new UpdateCommand(updateParams));
    console.log('Update result:', result.Attributes);
    
    console.log(`User ${userId} userType updated to: ${userType}`);
    
    return NextResponse.json({
      success: true,
      user: result.Attributes,
      message: `User type updated to ${userType}`
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    return NextResponse.json({ error: 'Failed to update user type' }, { status: 500 });
  }
}
