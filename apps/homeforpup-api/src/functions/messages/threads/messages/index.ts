import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, messages, messageThreads, eq, and, or, desc, sql } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

interface MessageItem {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string | null;
  subject: string | null;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: string;
  attachments?: any[];
}

const transformMessage = (item: MessageItem) => {
  return {
    id: item.id,
    senderId: item.senderId,
    senderName: item.senderName,
    receiverId: item.receiverId,
    receiverName: item.receiverName,
    subject: item.subject,
    content: item.content,
    timestamp: item.timestamp,
    read: item.read,
    messageType: item.messageType,
    threadId: item.threadId,
    attachments: item.attachments
  };
};

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event as any);
  const userId = getUserIdFromEvent(event as any);

  const threadId = event.pathParameters?.threadId;
  if (!threadId) {
    return errorResponse('Thread ID is required', 400);
  }

  console.log('Fetching messages for thread:', threadId, 'user:', userId.substring(0, 10) + '...');

  try {
    const db = getDb();

    // First, verify user has access to this thread
    const [threadData] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!threadData) {
      console.log('User does not have access to thread:', threadId);
      return errorResponse('Thread not found or access denied', 403);
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = (threadData.participants as string[]) || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return errorResponse('Access denied - not a participant', 403);
    }

    // Get limit from query params
    const limit = parseInt(event.queryStringParameters?.limit || '50');

    // Query messages for this thread
    const items = await db.select().from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);

    console.log('Database messages results:', items.length);

    // Additional security check: Filter messages to only include those where current user
    // is either sender or receiver
    const authorizedMessages = items.filter((item: any) =>
      item.senderId === userId || item.receiverId === userId
    );

    if (authorizedMessages.length !== items.length) {
      console.warn(`Filtered out ${items.length - authorizedMessages.length} unauthorized messages for user ${userId}`);
    }

    // Transform messages for frontend
    const transformedMessages = authorizedMessages.map((item: any) => transformMessage(item as MessageItem));

    console.log('Transformed authorized messages:', transformedMessages.length);

    return successResponse({ messages: transformedMessages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return errorResponse('Failed to fetch messages', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
