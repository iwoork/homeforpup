import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, UpdateCommand, GetCommand, QueryCommand } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'homeforpup-messages';
const THREADS_TABLE = process.env.THREADS_TABLE || 'homeforpup-message-threads';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event as any);
  const userId = getUserIdFromEvent(event as any);
  
  const threadId = event.pathParameters?.threadId;
  if (!threadId) {
    return errorResponse('Thread ID is required', 400);
  }

  console.log('Marking thread as read:', threadId, 'user:', userId.substring(0, 10) + '...');

  try {
    // Verify user has access to this thread
    const threadAccessCommand = new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` }
    });

    const threadAccessResult = await dynamodb.send(threadAccessCommand);
    if (!threadAccessResult.Item) {
      return errorResponse('Thread not found or access denied', 403);
    }

    // Get all unread messages in this thread for the user
    const messagesCommand = new QueryCommand({
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      FilterExpression: 'receiverId = :userId AND #read = :false',
      ExpressionAttributeNames: {
        '#read': 'read'
      },
      ExpressionAttributeValues: {
        ':threadId': threadId,
        ':userId': userId,
        ':false': false
      }
    });

    const messagesResult = await dynamodb.send(messagesCommand);
    const unreadMessages = messagesResult.Items || [];

    // Mark all unread messages as read
    const updatePromises = unreadMessages.map(msg => {
      const updateCommand = new UpdateCommand({
        TableName: MESSAGES_TABLE,
        Key: { PK: msg.PK, SK: msg.SK },
        UpdateExpression: 'SET #read = :true',
        ExpressionAttributeNames: {
          '#read': 'read'
        },
        ExpressionAttributeValues: {
          ':true': true
        }
      });
      return dynamodb.send(updateCommand);
    });

    await Promise.all(updatePromises);

    // Update thread's unread count for this user
    const threadData = threadAccessResult.Item;
    const currentUnreadCount = threadData.unreadCount || {};
    const newUnreadCount = {
      ...currentUnreadCount,
      [userId]: 0
    };

    // Update all thread records
    const threadUpdatePromises = [
      // Update main thread record
      dynamodb.send(new UpdateCommand({
        TableName: THREADS_TABLE,
        Key: { PK: threadId },
        UpdateExpression: 'SET unreadCount = :unreadCount',
        ExpressionAttributeValues: {
          ':unreadCount': newUnreadCount
        }
      })),
      // Update user's participant record
      dynamodb.send(new UpdateCommand({
        TableName: THREADS_TABLE,
        Key: { PK: `${threadId}#${userId}` },
        UpdateExpression: 'SET unreadCount = :unreadCount',
        ExpressionAttributeValues: {
          ':unreadCount': newUnreadCount
        }
      }))
    ];

    await Promise.all(threadUpdatePromises);

    console.log(`Marked ${unreadMessages.length} messages as read in thread ${threadId}`);

    return successResponse({ 
      success: true,
      markedCount: unreadMessages.length 
    });

  } catch (error) {
    console.error('Error marking thread as read:', error);
    return errorResponse('Failed to mark thread as read', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

