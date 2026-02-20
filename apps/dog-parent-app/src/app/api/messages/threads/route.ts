// src/app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messageThreads, sql, desc } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      console.log('No valid session found for threads request');
      return NextResponse.json({
        error: 'Your session has expired. Please refresh the page to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    console.log('Fetching threads for user:', userId?.substring(0, 10) + '...');

    // Query threads where user is a participant using jsonb containment
    const threads = await db.select().from(messageThreads)
      .where(sql`${messageThreads.participants}::jsonb @> ${JSON.stringify([userId])}::jsonb`)
      .orderBy(desc(messageThreads.updatedAt));

    console.log('Found threads:', threads.length);

    // Transform threads for frontend
    const transformedThreads = threads.map(item => ({
      id: item.id,
      subject: item.subject,
      participants: item.participants,
      participantNames: item.participantNames,
      lastMessage: item.lastMessage,
      messageCount: item.messageCount,
      unreadCount: item.unreadCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt
    }));

    return NextResponse.json({ threads: transformedThreads });

  } catch (error) {
    console.error('Error fetching threads:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch threads',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
