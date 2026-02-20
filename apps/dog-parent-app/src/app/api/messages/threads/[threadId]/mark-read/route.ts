import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';

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
    removeUndefinedValues: true,
    convertEmptyValues: false,
    convertClassInstanceToMap: false,
  },
});

const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'puppy-platform-dev-messages';
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;
    
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get all unread messages in this thread for this user
    const queryCommand = new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      FilterExpression: 'receiverId = :userId AND #read = :read',
      ExpressionAttributeNames: {
        '#read': 'read'
      },
      ExpressionAttributeValues: {
        ':threadId': threadId,
        ':userId': userId,
        ':read': false
      }
    });

    const result = await dynamodb.send(queryCommand);
    const unreadMessages = result.Items || [];

    if (unreadMessages.length === 0) {
      return NextResponse.json({ message: 'No unread messages to mark as read' });
    }

    // Mark all unread messages as read
    const updatePromises = unreadMessages.map(message => 
      dynamodb.send(new UpdateCommand({
        TableName: MESSAGES_TABLE,
        Key: {
          PK: message.PK,
          SK: message.SK
        },
        UpdateExpression: 'SET #read = :read, updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#read': 'read'
        },
        ExpressionAttributeValues: {
          ':read': true,
          ':updatedAt': new Date().toISOString()
        }
      }))
    );

    await Promise.all(updatePromises);

    // Update the thread's unread count for this user
    await dynamodb.send(new UpdateCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` },
      UpdateExpression: 'SET unreadCount.#userId = :zero',
      ExpressionAttributeNames: {
        '#userId': userId
      },
      ExpressionAttributeValues: {
        ':zero': 0
      }
    }));

    return NextResponse.json({ 
      message: `Marked ${unreadMessages.length} messages as read`,
      markedCount: unreadMessages.length
    });

  } catch (error) {
    console.error('Error marking thread messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
