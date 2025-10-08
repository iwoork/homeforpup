import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, QueryCommand, GetCommand } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

const MESSAGES_TABLE = process.env.MESSAGES_TABLE || 'homeforpup-messages';
const THREADS_TABLE = process.env.THREADS_TABLE || 'homeforpup-message-threads';

interface MessageItem {
  PK: string; // threadId
  SK: string; // messageId
  threadId: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  messageType: string;
  attachments?: any[];
  GSI1PK: string; // senderId
  GSI1SK: string; // timestamp
  GSI2PK: string; // receiverId
  GSI2SK: string; // timestamp
}

const transformMessage = (item: MessageItem) => {
  return {
    id: item.SK,
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
    // First, verify user has access to this thread by checking participant record
    const threadAccessCommand = new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` }
    });

    const threadAccessResult = await dynamodb.send(threadAccessCommand);
    if (!threadAccessResult.Item) {
      console.log('User does not have access to thread:', threadId);
      return errorResponse('Thread not found or access denied', 403);
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = threadAccessResult.Item.participants || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return errorResponse('Access denied - not a participant', 403);
    }

    // Get limit from query params
    const limit = parseInt(event.queryStringParameters?.limit || '50');

    // Query messages for this thread
    const queryParams = {
      TableName: MESSAGES_TABLE,
      KeyConditionExpression: 'PK = :threadId',
      ExpressionAttributeValues: {
        ':threadId': threadId
      },
      ScanIndexForward: false, // Most recent first
      Limit: limit
    };

    console.log('DynamoDB Query params:', queryParams);

    const command = new QueryCommand(queryParams);
    const result = await dynamodb.send(command);
    const items = (result.Items as MessageItem[]) || [];

    console.log('Raw DynamoDB messages results:', items.length);

    // Additional security check: Filter messages to only include those where current user 
    // is either sender or receiver
    const authorizedMessages = items.filter(item => 
      item.senderId === userId || item.receiverId === userId
    );

    if (authorizedMessages.length !== items.length) {
      console.warn(`Filtered out ${items.length - authorizedMessages.length} unauthorized messages for user ${userId}`);
    }

    // Transform messages for frontend
    const messages = authorizedMessages.map(transformMessage);

    console.log('Transformed authorized messages:', messages.length);

    return successResponse({ messages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return errorResponse('Failed to fetch messages', 500, {
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    });
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

