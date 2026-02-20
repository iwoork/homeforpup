import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, messages, messageThreads, eq, and, sql } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

// Helper to remove undefined values
const cleanUndefinedValues = (obj: any): any => {
  if (obj === null || obj === undefined) return obj;
  if (Array.isArray(obj)) return obj.map(cleanUndefinedValues);
  if (typeof obj === 'object') {
    return Object.entries(obj).reduce((acc, [key, value]) => {
      if (value !== undefined) {
        acc[key] = cleanUndefinedValues(value);
      }
      return acc;
    }, {} as any);
  }
  return obj;
};

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event as any);
  const authenticatedUserId = getUserIdFromEvent(event as any);

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  try {
    const body = JSON.parse(event.body);
    const { threadId, content, receiverId, receiverName, subject } = body;

    // Validation
    if (!threadId || !content || !receiverId) {
      return errorResponse('Missing required fields: threadId, content, receiverId', 400);
    }

    const db = getDb();

    // Verify user has access to this thread
    const [threadData] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!threadData) {
      return errorResponse('Thread not found or access denied', 403);
    }

    // Verify user is a participant
    const participants = (threadData.participants as string[]) || [];
    if (!participants.includes(authenticatedUserId)) {
      return errorResponse('Thread not found or access denied', 403);
    }

    // Generate IDs
    const timestamp = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get sender name from thread data
    const participantNames = (threadData.participantNames as Record<string, string>) || {};
    const senderName = participantNames[authenticatedUserId] || 'Unknown';
    const finalReceiverName = receiverName || participantNames[receiverId] || 'Unknown';

    // Create message
    const message = cleanUndefinedValues({
      id: messageId,
      threadId,
      senderId: authenticatedUserId,
      senderName,
      receiverId,
      receiverName: finalReceiverName,
      subject: subject || threadData.subject,
      content,
      timestamp,
      read: false,
      messageType: (threadData.lastMessage as any)?.messageType || 'general',
      attachments: []
    });

    // Update thread's unread count for receiver
    const currentUnreadCount = (threadData.unreadCount as Record<string, number>) || {};
    const newUnreadCount = {
      ...currentUnreadCount,
      [receiverId]: (currentUnreadCount[receiverId] || 0) + 1
    };

    // Transaction to create message and update thread
    await db.transaction(async (tx) => {
      // Create message
      await tx.insert(messages).values(message);

      // Update thread record
      await tx.update(messageThreads).set({
        lastMessage: message,
        updatedAt: timestamp,
        messageCount: (threadData.messageCount || 0) + 1,
        unreadCount: newUnreadCount,
      }).where(eq(messageThreads.id, threadId));
    });

    console.log('Reply sent successfully:', {
      threadId,
      messageId,
      from: `${senderName} (${authenticatedUserId.substring(0, 10)}...)`,
      to: `${finalReceiverName} (${receiverId.substring(0, 10)}...)`
    });

    return successResponse({ message }, 201);

  } catch (error) {
    console.error('Error sending reply:', error);
    return errorResponse('Failed to send reply', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
