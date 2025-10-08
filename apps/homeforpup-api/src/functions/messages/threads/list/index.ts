import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, QueryCommand } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

const THREADS_TABLE = process.env.THREADS_TABLE || 'homeforpup-message-threads';

interface ThreadItem {
  PK: string; // threadId or threadId#participantId
  threadId: string;
  subject: string;
  participants: string[];
  participantNames?: Record<string, string>;
  lastMessage?: {
    id: string;
    senderId: string;
    senderName: string;
    receiverId: string;
    receiverName: string;
    subject: string;
    content: string;
    timestamp: string;
    read: boolean;
    messageType: string;
  };
  messageCount: number;
  unreadCount: Record<string, number>;
  createdAt: string;
  updatedAt: string;
  GSI1PK: string; // userId for querying
  GSI1SK: string; // timestamp
}

const transformThread = (item: ThreadItem, userId: string) => {
  const otherParticipant = item.participants?.find(p => p !== userId);
  
  // Ensure lastMessage has all required fields
  const lastMessage = item.lastMessage ? {
    id: item.lastMessage.id || '',
    senderId: item.lastMessage.senderId || '',
    senderName: item.lastMessage.senderName || 'Unknown',
    receiverId: item.lastMessage.receiverId || otherParticipant || '',
    receiverName: item.lastMessage.receiverName || (otherParticipant && item.participantNames?.[otherParticipant]) || 'Unknown',
    subject: item.lastMessage.subject || item.subject || '',
    content: item.lastMessage.content || '',
    timestamp: item.lastMessage.timestamp || item.updatedAt || '',
    read: item.lastMessage.read ?? false,
    messageType: item.lastMessage.messageType || 'general',
  } : undefined;
  
  return {
    id: item.threadId,
    subject: item.subject,
    participants: item.participants,
    participantNames: item.participantNames,
    lastMessage,
    messageCount: item.messageCount || 0,
    unreadCount: item.unreadCount || {},
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    otherParticipant,
    otherParticipantName: otherParticipant && item.participantNames 
      ? item.participantNames[otherParticipant] 
      : 'Unknown'
  };
};

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event as any);
  const userId = getUserIdFromEvent(event as any);

  console.log('Fetching threads for user:', userId?.substring(0, 10) + '...');

  try {
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
      .filter(thread => thread.participants.includes(userId));

    console.log('Final transformed threads:', threads.length);

    return successResponse({ threads });

  } catch (error) {
    console.error('Error fetching threads:', error);
    return errorResponse('Failed to fetch threads', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

