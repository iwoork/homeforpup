// src/app/api/messages/threads/[threadId]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/utils/auth';

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
    removeUndefinedValues: true,
    convertEmptyValues: false,
    convertClassInstanceToMap: false,
  },
});
const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'puppy-platform-dev-messages';
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;
    
    // Get and verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    let userId: string;
    try {
      const { userId: verifiedUserId } = await verifyJWT(token);
      userId = verifiedUserId;
      console.log('JWT verification successful for mark as read, user:', userId.substring(0, 10) + '...');
    } catch (verificationError) {
      console.error('JWT verification failed:', verificationError);
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }

    console.log('Marking thread as read:', threadId, 'for user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread
    const threadResult = await dynamodb.send(new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` }
    }));

    if (!threadResult.Item) {
      console.log('Thread not found or access denied for user:', userId);
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = threadResult.Item.participants || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return NextResponse.json({ error: 'Access denied - not a participant' }, { status: 403 });
    }

    // Mark all unread messages in thread as read for this user
    // Only mark messages where the current user is the receiver (for security)
    const messagesResult = await dynamodb.send(new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      FilterExpression: 'receiverId = :userId AND #read = :false',
      ExpressionAttributeNames: {
        '#read': 'read'
      },
      ExpressionAttributeValues: {
        ':threadId': threadId,
        ':userId': userId,
        ':false': false
      }
    }));

    const unreadMessages = messagesResult.Items || [];

    console.log(`Found ${unreadMessages.length} unread messages for user ${userId} in thread ${threadId}`);

    // Update each unread message to mark as read
    const updatePromises = unreadMessages.map(message => {
      return dynamodb.send(new UpdateCommand({
        TableName: MESSAGES_TABLE,
        Key: { PK: message.PK, SK: message.SK },
        UpdateExpression: 'SET #read = :true',
        ExpressionAttributeNames: {
          '#read': 'read'
        },
        ExpressionAttributeValues: {
          ':true': true
        }
      }));
    });

    await Promise.all(updatePromises);

    // Reset unread count for user in thread participant records
    await dynamodb.send(new UpdateCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` },
      UpdateExpression: 'SET unreadCount.#user = :zero',
      ExpressionAttributeNames: {
        '#user': userId
      },
      ExpressionAttributeValues: {
        ':zero': 0
      }
    }));

    // Also update the main thread record
    await dynamodb.send(new UpdateCommand({
      TableName: THREADS_TABLE,
      Key: { PK: threadId },
      UpdateExpression: 'SET unreadCount.#user = :zero',
      ExpressionAttributeNames: {
        '#user': userId
      },
      ExpressionAttributeValues: {
        ':zero': 0
      }
    }));

    console.log('Thread marked as read successfully. Updated', unreadMessages.length, 'messages');

    return NextResponse.json({ 
      success: true, 
      messagesMarked: unreadMessages.length 
    });

  } catch (error) {
    console.error('Error marking thread as read:', error);
    
    // Handle specific JWT errors
    if (error instanceof Error) {
      if (error.message.includes('Token expired') || error.message.includes('Invalid token')) {
        return NextResponse.json({ error: 'Authentication expired. Please log in again.' }, { status: 401 });
      }
      if (error.message.includes('Token verification failed')) {
        return NextResponse.json({ error: 'Invalid authentication.' }, { status: 401 });
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to mark thread as read',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}