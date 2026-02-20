import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, messageThreads, sql, desc } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

interface ThreadItem {
  id: string;
  subject: string | null;
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
    id: item.id,
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
    const db = getDb();

    // Query threads where user is a participant using jsonb contains
    // This replaces the DynamoDB GSI1 query pattern
    const items = await db.select().from(messageThreads)
      .where(sql`${messageThreads.participants}::jsonb @> ${JSON.stringify([userId])}::jsonb`)
      .orderBy(desc(messageThreads.updatedAt));

    console.log('Database threads results:', items.length);

    // Filter to ensure current user is in participants for security
    const participantRecords = items.filter((item: any) =>
      item.participants &&
      (item.participants as string[]).includes(userId)
    );

    console.log('Filtered participant records:', participantRecords.length);

    // Transform threads for frontend
    const threads = participantRecords
      .map((item: any) => transformThread(item as ThreadItem, userId))
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
