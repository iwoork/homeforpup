import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, messages, messageThreads, eq, and, sql } from '../../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../../types/lambda';
import { wrapHandler } from '../../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../../middleware/auth';

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
    const db = getDb();

    // Verify user has access to this thread
    const [threadData] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!threadData) {
      return errorResponse('Thread not found or access denied', 403);
    }

    // Verify user is a participant
    const participants = (threadData.participants as string[]) || [];
    if (!participants.includes(userId)) {
      return errorResponse('Thread not found or access denied', 403);
    }

    // Get all unread messages in this thread for the user
    const unreadMessages = await db.select().from(messages)
      .where(
        and(
          eq(messages.threadId, threadId),
          eq(messages.receiverId, userId),
          eq(messages.read, false)
        )
      );

    // Mark all unread messages as read
    if (unreadMessages.length > 0) {
      await db.update(messages).set({ read: true })
        .where(
          and(
            eq(messages.threadId, threadId),
            eq(messages.receiverId, userId),
            eq(messages.read, false)
          )
        );
    }

    // Update thread's unread count for this user
    const currentUnreadCount = (threadData.unreadCount as Record<string, number>) || {};
    const newUnreadCount = {
      ...currentUnreadCount,
      [userId]: 0
    };

    // Update thread record
    await db.update(messageThreads).set({
      unreadCount: newUnreadCount,
    }).where(eq(messageThreads.id, threadId));

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
