// src/app/api/messages/threads/[threadId]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/utils/auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
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

    const { userId } = await verifyJWT(token);
    console.log('Marking thread as read:', threadId, 'for user:', userId);

    // First, verify user has access to this thread
    const threadResult = await dynamodb.send(new QueryCommand({
      TableName: THREADS_TABLE,
      KeyConditionExpression: 'PK = :pk',
      ExpressionAttributeValues: {
        ':pk': `${threadId}#${userId}`
      }
    }));

    if (!threadResult.Items || threadResult.Items.length === 0) {
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Mark all unread messages in thread as read for this user
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
    return NextResponse.json(
      { 
        error: 'Failed to mark thread as read',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}