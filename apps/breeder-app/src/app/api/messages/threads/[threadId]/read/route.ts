// src/app/api/messages/threads/[threadId]/read/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, eq, and, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;

    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      console.log('No valid session found for mark as read request');
      return NextResponse.json({
        error: 'Your session has expired. Please refresh the page to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    console.log('Marking thread as read:', threadId, 'for user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!thread) {
      console.log('Thread not found or access denied for user:', userId);
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = (thread.participants as string[]) || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return NextResponse.json({ error: 'Access denied - not a participant' }, { status: 403 });
    }

    // Mark all unread messages in thread as read for this user
    // Only mark messages where the current user is the receiver (for security)
    const unreadMessages = await db.select().from(messages).where(
      and(
        eq(messages.threadId, threadId),
        eq(messages.receiverId, userId),
        eq(messages.read, false)
      )
    );

    console.log(`Found ${unreadMessages.length} unread messages for user ${userId} in thread ${threadId}`);

    // Update each unread message to mark as read
    const updatePromises = unreadMessages.map(message =>
      db.update(messages)
        .set({ read: true })
        .where(eq(messages.id, message.id))
    );

    await Promise.all(updatePromises);

    // Reset unread count for user in thread
    const unreadCount = (thread.unreadCount as Record<string, number>) || {};
    unreadCount[userId] = 0;
    await db.update(messageThreads)
      .set({ unreadCount })
      .where(eq(messageThreads.id, threadId));

    console.log('Thread marked as read successfully. Updated', unreadMessages.length, 'messages');

    return NextResponse.json({
      success: true,
      messagesMarked: unreadMessages.length
    });

  } catch (error) {
    console.error('Error marking thread as read:', error);

    // Handle specific JWT errors
    if (error instanceof Error) {
      if (error.message.includes('Token expired') || error.message.includes('Invalid token')) {
        return NextResponse.json({ error: 'Authentication expired. Please log in again.' }, { status: 401 });
      }
      if (error.message.includes('Token verification failed')) {
        return NextResponse.json({ error: 'Invalid authentication.' }, { status: 401 });
      }
    }

    return NextResponse.json(
      {
        error: 'Failed to mark thread as read',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
