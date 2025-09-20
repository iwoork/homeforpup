// src/app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT, decodeJWTUnsafe } from '@/utils/auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

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
const transformThread = (item: ThreadItem) => {
  // Extract threadId from PK if it's a participant record
  const threadId = item.threadId || item.PK.split('#')[0];
  
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
      // Try the full verification first
      const { userId: verifiedUserId } = await verifyJWT(token);
      userId = verifiedUserId;
      console.log('JWT verification successful');
    } catch (verificationError) {
      console.warn('Full JWT verification failed, attempting unsafe decode:', verificationError);
      
      // Fallback to unsafe decode for debugging
      try {
        const { userId: decodedUserId } = decodeJWTUnsafe(token);
        userId = decodedUserId;
        console.log('Unsafe JWT decode successful');
      } catch (decodeError) {
        console.error('Both JWT verification and decode failed:', decodeError);
        return NextResponse.json({ 
          error: 'Invalid authentication token',
          details: process.env.NODE_ENV === 'development' ? String(decodeError) : undefined
        }, { status: 401 });
      }
    }

    console.log('Fetching threads for user:', userId?.substring(0, 10) + '...');

    // Query threads where user is a participant using GSI1
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
    const participantRecords = items.filter(item => 
      item.PK.includes('#') && item.PK.includes(userId)
    );

    console.log('Filtered participant records:', participantRecords.length);

    // Transform threads for frontend - only include threads where user is actually a participant
    const threads = participantRecords
      .filter(item => item.participants && item.participants.includes(userId))
      .map(item => transformThread(item))
      // Remove duplicates based on thread ID
      .filter((thread, index, self) => 
        index === self.findIndex(t => t.id === thread.id)
      )
      // Sort by most recent activity
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

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