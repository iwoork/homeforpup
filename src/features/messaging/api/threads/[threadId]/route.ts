// src/app/api/messages/threads/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/lib';

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

export async function DELETE(
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
      console.log('JWT verification successful for delete request, user:', userId.substring(0, 10) + '...');
    } catch (verificationError) {
      console.error('JWT verification failed:', verificationError);
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }

    console.log('Deleting thread:', threadId, 'for user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread
    const threadAccessCommand = new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` }
    });

    const threadAccessResult = await dynamodb.send(threadAccessCommand);
    if (!threadAccessResult.Item) {
      console.log('User does not have access to thread:', threadId);
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = threadAccessResult.Item.participants || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return NextResponse.json({ error: 'Access denied - not a participant' }, { status: 403 });
    }

    // Get all messages in the thread to delete them
    const messagesQuery = new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      ExpressionAttributeValues: {
        ':threadId': threadId
      }
    });

    const messagesResult = await dynamodb.send(messagesQuery);
    const messages = messagesResult.Items || [];

    // Get all thread records (main thread + participant records)
    const threadsQuery = new QueryCommand({
      TableName: THREADS_TABLE,
      KeyConditionExpression: 'PK = :threadId OR begins_with(PK, :threadIdPrefix)',
      ExpressionAttributeValues: {
        ':threadId': threadId,
        ':threadIdPrefix': `${threadId}#`
      }
    });

    const threadsResult = await dynamodb.send(threadsQuery);
    const threadRecords = threadsResult.Items || [];

    // Prepare transaction items for deletion
    const transactItems = [];

    // Delete all messages (only include messages where user is sender or receiver for security)
    for (const message of messages) {
      if (message.senderId === userId || message.receiverId === userId) {
        transactItems.push({
          Delete: {
            TableName: MESSAGES_TABLE,
            Key: { PK: message.PK, SK: message.SK }
          }
        });
      }
    }

    // Delete all thread records (main thread + all participant records)
    for (const threadRecord of threadRecords) {
      transactItems.push({
        Delete: {
          TableName: THREADS_TABLE,
          Key: { PK: threadRecord.PK }
        }
      });
    }

    // Execute deletion transaction
    if (transactItems.length > 0) {
      // DynamoDB TransactWrite has a limit of 100 items, so we might need to batch
      const batchSize = 100;
      for (let i = 0; i < transactItems.length; i += batchSize) {
        const batch = transactItems.slice(i, i + batchSize);
        const command = new TransactWriteCommand({
          TransactItems: batch
        });
        await dynamodb.send(command);
      }
    }

    console.log('Thread deleted successfully:', threadId, 'Items deleted:', transactItems.length);

    return NextResponse.json({ 
      success: true, 
      deletedItems: transactItems.length 
    });

  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      { 
        error: 'Failed to delete thread',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}