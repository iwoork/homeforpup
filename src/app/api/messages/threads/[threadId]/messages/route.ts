// src/app/api/messages/threads/[threadId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
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

// Message interface matching DynamoDB structure
interface MessageItem {
  PK: string; // threadId
  SK: string; // messageId
  threadId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: string;
  attachments?: any[];
  GSI1PK: string; // senderId
  GSI1SK: string; // timestamp
  GSI2PK: string; // receiverId
  GSI2SK: string; // timestamp
}

// Transform message data for frontend
const transformMessage = (item: MessageItem) => {
  return {
    id: item.SK,
    threadId: item.threadId,
    senderId: item.senderId,
    senderName: item.senderName,
    receiverId: item.receiverId,
    receiverName: item.receiverName,
    subject: item.subject,
    content: item.content,
    timestamp: item.timestamp,
    read: item.read,
    messageType: item.messageType,
    attachments: item.attachments
  };
};

export async function GET(
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
      console.log('JWT verification successful for messages request, user:', userId.substring(0, 10) + '...');
    } catch (verificationError) {
      console.error('JWT verification failed:', verificationError);
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }

    console.log('Fetching messages for thread:', threadId, 'user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread by checking participant record
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

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Query messages for this thread
    const queryParams = {
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      ExpressionAttributeValues: {
        ':threadId': threadId
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit
    };

    console.log('DynamoDB Query params:', queryParams);

    const command = new QueryCommand(queryParams);
    const result = await dynamodb.send(command);
    const items = (result.Items as MessageItem[]) || [];

    console.log('Raw DynamoDB messages results:', items.length);

    // Additional security check: Filter messages to only include those where current user 
    // is either sender or receiver
    const authorizedMessages = items.filter(item => 
      item.senderId === userId || item.receiverId === userId
    );

    if (authorizedMessages.length !== items.length) {
      console.warn(`Filtered out ${items.length - authorizedMessages.length} unauthorized messages for user ${userId}`);
    }

    // Transform messages for frontend
    const messages = authorizedMessages.map(transformMessage);

    console.log('Transformed authorized messages:', messages.length);

    return NextResponse.json({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch messages',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}