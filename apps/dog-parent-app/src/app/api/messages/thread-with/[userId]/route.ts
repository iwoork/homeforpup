import { NextRequest, NextResponse } from 'next/server';
import { db, messageThreads, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ userId: string }> }
) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ exists: false, threadId: null });
    }

    const currentUserId = userId;
    const { userId: otherUserId } = await context.params;

    if (!otherUserId) {
      return NextResponse.json({ exists: false, threadId: null });
    }

    // Query threads where both users are participants using jsonb containment
    const threads = await db.select().from(messageThreads)
      .where(sql`${messageThreads.participants}::jsonb @> ${JSON.stringify([currentUserId])}::jsonb
        AND ${messageThreads.participants}::jsonb @> ${JSON.stringify([otherUserId])}::jsonb`)
      .limit(1);

    if (threads.length > 0) {
      return NextResponse.json({
        exists: true,
        threadId: threads[0].id,
        subject: threads[0].subject || null,
      });
    }

    return NextResponse.json({ exists: false, threadId: null });
  } catch (error) {
    console.error('Error checking thread with user:', error);
    return NextResponse.json({ exists: false, threadId: null }, { status: 500 });
  }
}
