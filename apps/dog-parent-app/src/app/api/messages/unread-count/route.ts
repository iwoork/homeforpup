import { NextRequest, NextResponse } from 'next/server';
import { db, messageThreads, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ unreadCount: 0 }, { status: 401 });
    }

    // Query threads where user is a participant
    const threads = await db.select().from(messageThreads)
      .where(sql`${messageThreads.participants}::jsonb @> ${JSON.stringify([userId])}::jsonb`);

    // Sum unread counts for this user across all threads
    const totalUnread = threads.reduce((total, thread) => {
      const threadUnread = (thread.unreadCount as Record<string, number>)?.[userId] || 0;
      return total + threadUnread;
    }, 0);

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ unreadCount: 0 }, { status: 500 });
  }
}
