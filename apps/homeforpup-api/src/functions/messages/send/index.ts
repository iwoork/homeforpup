import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, messages, messageThreads, profiles, eq } from '../../../shared/dynamodb';
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
    const { recipientId, recipientName, subject, content, messageType = 'general' } = body;

    // Validation
    if (!recipientId || !subject || !content) {
      return errorResponse('Missing required fields: recipientId, subject, content', 400);
    }

    // Prevent users from messaging themselves
    if (authenticatedUserId === recipientId) {
      return errorResponse('Cannot send message to yourself', 400);
    }

    const db = getDb();

    // Helper to get user info
    const getUserInfo = async (userId: string) => {
      try {
        const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
        return profile;
      } catch (error) {
        console.error('Error fetching user:', error);
        return null;
      }
    };

    // Get sender info
    const senderInfo = await getUserInfo(authenticatedUserId);
    const senderName = senderInfo?.name || senderInfo?.email || 'Unknown';

    // Get receiver info if name not provided
    let receiverName = recipientName;
    if (!receiverName) {
      const receiverInfo = await getUserInfo(recipientId);
      receiverName = receiverInfo?.name || receiverInfo?.email || 'Unknown';
    }

    // Generate IDs
    const timestamp = new Date().toISOString();
    const threadId = `thread_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create message
    const message = cleanUndefinedValues({
      id: messageId,
      threadId,
      senderId: authenticatedUserId,
      senderName,
      receiverId: recipientId,
      receiverName,
      subject,
      content,
      timestamp,
      read: false,
      messageType,
      attachments: []
    });

    // Create thread
    const thread = cleanUndefinedValues({
      id: threadId,
      subject,
      participants: [authenticatedUserId, recipientId],
      participantNames: {
        [authenticatedUserId]: senderName,
        [recipientId]: receiverName
      },
      lastMessage: message,
      messageCount: 1,
      unreadCount: {
        [authenticatedUserId]: 0,
        [recipientId]: 1
      },
      createdAt: timestamp,
      updatedAt: timestamp
    });

    // Transaction to create both thread and message atomically
    await db.transaction(async (tx) => {
      // Create thread
      await tx.insert(messageThreads).values(thread);
      // Create message
      await tx.insert(messages).values(message);
    });

    console.log('Thread and message created successfully:', {
      threadId,
      messageId,
      from: `${senderName} (${authenticatedUserId.substring(0, 10)}...)`,
      to: `${receiverName} (${recipientId.substring(0, 10)}...)`
    });

    return successResponse({ thread, message }, 201);

  } catch (error) {
    console.error('Error sending message:', error);
    return errorResponse('Failed to send message', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
