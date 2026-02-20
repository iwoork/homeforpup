import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, eq, and, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ threadId: string }> }
) {
  try {
    const routeParams = await params;
    const { threadId } = routeParams;

    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get all unread messages in this thread for this user
    const unreadMessages = await db.select().from(messages).where(
      and(
        eq(messages.threadId, threadId),
        eq(messages.receiverId, userId),
        eq(messages.read, false)
      )
    );

    if (unreadMessages.length === 0) {
      return NextResponse.json({ message: 'No unread messages to mark as read' });
    }

    // Mark all unread messages as read
    const updatePromises = unreadMessages.map(message =>
      db.update(messages)
        .set({ read: true })
        .where(eq(messages.id, message.id))
    );

    await Promise.all(updatePromises);

    // Update the thread's unread count for this user
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);
    if (thread) {
      const unreadCount = (thread.unreadCount as Record<string, number>) || {};
      unreadCount[userId] = 0;
      await db.update(messageThreads)
        .set({ unreadCount })
        .where(eq(messageThreads.id, threadId));
    }

    return NextResponse.json({
      message: `Marked ${unreadMessages.length} messages as read`,
      markedCount: unreadMessages.length
    });

  } catch (error) {
    console.error('Error marking thread messages as read:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
