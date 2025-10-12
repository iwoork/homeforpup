import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, TransactWriteCommand, GetCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'homeforpup-messages';
const THREADS_TABLE = process.env.THREADS_TABLE || 'homeforpup-message-threads';
const USERS_TABLE = process.env.USERS_TABLE || 'homeforpup-users';

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

// Helper to get user info
const getUserInfo = async (userId: string) => {
  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId }
    });
    const result = await dynamodb.send(command);
    return result.Item;
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
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
    const transactItems = [
      // Create message
      {
        Put: {
          TableName: MESSAGES_TABLE,
          Item: cleanUndefinedValues({
            PK: threadId,
            SK: messageId,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp,
            GSI2PK: recipientId,
            GSI2SK: timestamp,
            ...message
          })
        }
      },
      // Create main thread record
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: threadId,
            threadId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          })
        }
      },
      // Create participant record for sender
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: `${threadId}#${authenticatedUserId}`,
            threadId,
            participantId: authenticatedUserId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          })
        }
      },
      // Create participant record for recipient
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: `${threadId}#${recipientId}`,
            threadId,
            participantId: recipientId,
            ...thread,
            GSI1PK: recipientId,
            GSI1SK: timestamp
          })
        }
      }
    ];

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await dynamodb.send(command);

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

