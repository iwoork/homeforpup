import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, TransactWriteCommand, GetCommand, UpdateCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'homeforpup-messages';
const THREADS_TABLE = process.env.THREADS_TABLE || 'homeforpup-message-threads';

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

    // Verify user has access to this thread
    const threadAccessCommand = new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${authenticatedUserId}` }
    });

    const threadAccessResult = await dynamodb.send(threadAccessCommand);
    if (!threadAccessResult.Item) {
      return errorResponse('Thread not found or access denied', 403);
    }

    const threadData = threadAccessResult.Item;
    
    // Generate IDs
    const timestamp = new Date().toISOString();
    const messageId = `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get sender name from thread data
    const senderName = threadData.participantNames?.[authenticatedUserId] || 'Unknown';
    const finalReceiverName = receiverName || threadData.participantNames?.[receiverId] || 'Unknown';

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
      messageType: threadData.lastMessage?.messageType || 'general',
      attachments: []
    });

    // Update thread's unread count for receiver
    const currentUnreadCount = threadData.unreadCount || {};
    const newUnreadCount = {
      ...currentUnreadCount,
      [receiverId]: (currentUnreadCount[receiverId] || 0) + 1
    };

    // Transaction to create message and update threads
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
            GSI2PK: receiverId,
            GSI2SK: timestamp,
            ...message
          })
        }
      },
      // Update main thread record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: threadId },
          UpdateExpression: 'SET lastMessage = :lastMessage, updatedAt = :updatedAt, messageCount = messageCount + :inc, unreadCount = :unreadCount',
          ExpressionAttributeValues: {
            ':lastMessage': message,
            ':updatedAt': timestamp,
            ':inc': 1,
            ':unreadCount': newUnreadCount
          }
        }
      },
      // Update sender's participant record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: `${threadId}#${authenticatedUserId}` },
          UpdateExpression: 'SET lastMessage = :lastMessage, updatedAt = :updatedAt, messageCount = messageCount + :inc, unreadCount = :unreadCount, GSI1SK = :timestamp',
          ExpressionAttributeValues: {
            ':lastMessage': message,
            ':updatedAt': timestamp,
            ':inc': 1,
            ':unreadCount': newUnreadCount,
            ':timestamp': timestamp
          }
        }
      },
      // Update receiver's participant record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: `${threadId}#${receiverId}` },
          UpdateExpression: 'SET lastMessage = :lastMessage, updatedAt = :updatedAt, messageCount = messageCount + :inc, unreadCount = :unreadCount, GSI1SK = :timestamp',
          ExpressionAttributeValues: {
            ':lastMessage': message,
            ':updatedAt': timestamp,
            ':inc': 1,
            ':unreadCount': newUnreadCount,
            ':timestamp': timestamp
          }
        }
      }
    ];

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await dynamodb.send(command);

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

