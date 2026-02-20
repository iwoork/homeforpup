// src/app/api/messages/threads/[threadId]/messages/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, eq, and, or, desc, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// Transform message data for frontend
const transformMessage = (item: any) => {
  return {
    id: item.id,
    threadId: item.threadId,
    senderId: item.senderId,
    senderName: item.senderName,
    receiverId: item.receiverId,
    receiverName: item.receiverName,
    subject: item.subject,
    content: item.content,
    timestamp: item.timestamp,
    read: item.read,
    messageType: item.messageType,
    attachments: item.attachments
  };
};

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;

    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      console.log('No valid session found for messages request');
      return NextResponse.json({
        error: 'Your session has expired. Please refresh the page to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    console.log('Fetching messages for thread:', threadId, 'user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!thread) {
      console.log('User does not have access to thread:', threadId);
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = (thread.participants as string[]) || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return NextResponse.json({ error: 'Access denied - not a participant' }, { status: 403 });
    }

    // Get limit from query params
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');

    // Query messages for this thread
    const items = await db.select().from(messages)
      .where(eq(messages.threadId, threadId))
      .orderBy(desc(messages.timestamp))
      .limit(limit);

    console.log('Raw messages results:', items.length);

    // Additional security check: Filter messages to only include those where current user
    // is either sender or receiver
    const authorizedMessages = items.filter(item =>
      item.senderId === userId || item.receiverId === userId
    );

    if (authorizedMessages.length !== items.length) {
      console.warn(`Filtered out ${items.length - authorizedMessages.length} unauthorized messages for user ${userId}`);
    }

    // Transform messages for frontend
    const transformedMessages = authorizedMessages.map(transformMessage);

    console.log('Transformed authorized messages:', transformedMessages.length);

    return NextResponse.json({ messages: transformedMessages });

  } catch (error) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch messages',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
