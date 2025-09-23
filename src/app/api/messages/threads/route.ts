// src/app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
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
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'homeforpup-message-threads';

// Thread interface matching DynamoDB structure
interface ThreadItem {
  PK: string; // threadId or threadId#participantId
  threadId?: string;
  participantId?: string;
  participants: string[];
  participantNames: Record<string, string>;
  subject: string;
  lastMessage: any;
  messageCount: number;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // participantId for querying user's threads
  GSI1SK: string; // updatedAt for sorting
}

// Transform thread data for frontend
const transformThread = (item: ThreadItem, currentUserId: string) => {
  // Extract threadId from PK if it's a participant record
  const threadId = item.threadId || item.PK.split('#')[0];
  
  // Only return threads where current user is a participant
  if (!item.participants.includes(currentUserId)) {
    return null;
  }
  
  return {
    id: threadId,
    subject: item.subject,
    participants: item.participants,
    participantNames: item.participantNames,
    lastMessage: item.lastMessage,
    messageCount: item.messageCount,
    unreadCount: item.unreadCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

export async function GET(request: NextRequest) {
  try {
    // Get and verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    console.log('Attempting to verify JWT token for threads request...');

    let userId: string;
    
    try {
      // Use full verification for security
      const { userId: verifiedUserId } = await verifyJWT(token);
      userId = verifiedUserId;
      console.log('JWT verification successful for user:', userId.substring(0, 10) + '...');
    } catch (verificationError) {
      console.error('JWT verification failed:', verificationError);
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }

    console.log('Fetching threads for user:', userId?.substring(0, 10) + '...');

    // Query threads where user is a participant using GSI1
    // This ensures we only get threads for the authenticated user
    const params = {
      TableName: THREADS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :userId',
      ExpressionAttributeValues: {
        ':userId': userId
      },
      ScanIndexForward: false // Most recent first
    };

    console.log('DynamoDB Query params:', {
      ...params,
      ExpressionAttributeValues: { ':userId': userId?.substring(0, 10) + '...' }
    });

    const command = new QueryCommand(params);
    const result = await dynamodb.send(command);
    const items = (result.Items as ThreadItem[]) || [];

    console.log('Raw DynamoDB threads results:', items.length);

    // Filter to only get participant records (not main thread records)
    // Participant records have PK format: threadId#participantId
    // AND ensure the current user is in the participants array for security
    const participantRecords = items.filter(item => 
      item.PK.includes('#') && 
      item.PK.includes(userId) &&
      item.participants && 
      item.participants.includes(userId)
    );

    console.log('Filtered participant records:', participantRecords.length);

    // Transform threads for frontend - with additional security check
    const threads = participantRecords
      .map(item => transformThread(item, userId))
      .filter(thread => thread !== null) // Remove any null results from security filtering
      // Remove duplicates based on thread ID
      .filter((thread, index, self) => 
        index === self.findIndex(t => t!.id === thread!.id)
      )
      // Sort by most recent activity
      .sort((a, b) => new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime());

    console.log('Final transformed threads:', threads.length);

    return NextResponse.json({ threads });

  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch threads',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}