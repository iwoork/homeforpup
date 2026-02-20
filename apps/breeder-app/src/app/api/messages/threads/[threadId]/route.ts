// src/app/api/messages/threads/[threadId]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, eq, and, or, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;

    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      console.log('No valid session found for delete request');
      return NextResponse.json({
        error: 'Your session has expired. Please refresh the page to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    console.log('Deleting thread:', threadId, 'for user:', userId.substring(0, 10) + '...');

    // First, verify user has access to this thread
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);

    if (!thread) {
      console.log('Thread not found:', threadId);
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    // Verify user is actually a participant in the thread
    const threadParticipants = (thread.participants as string[]) || [];
    if (!threadParticipants.includes(userId)) {
      console.log('User is not a participant in thread:', threadId);
      return NextResponse.json({ error: 'Access denied - not a participant' }, { status: 403 });
    }

    // Delete all messages in the thread where user is sender or receiver
    const threadMessages = await db.select().from(messages).where(
      and(
        eq(messages.threadId, threadId),
        or(
          eq(messages.senderId, userId),
          eq(messages.receiverId, userId)
        )
      )
    );

    let deletedCount = 0;

    // Delete messages
    if (threadMessages.length > 0) {
      const messageIds = threadMessages.map(m => m.id);
      for (const msgId of messageIds) {
        await db.delete(messages).where(eq(messages.id, msgId));
        deletedCount++;
      }
    }

    // Delete the thread
    await db.delete(messageThreads).where(eq(messageThreads.id, threadId));
    deletedCount++;

    console.log('Thread deleted successfully:', threadId, 'Items deleted:', deletedCount);

    return NextResponse.json({
      success: true,
      deletedItems: deletedCount
    });

  } catch (error) {
    console.error('Error deleting thread:', error);
    return NextResponse.json(
      {
        error: 'Failed to delete thread',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
