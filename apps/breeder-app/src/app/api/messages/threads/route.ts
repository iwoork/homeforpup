// src/app/api/messages/threads/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messageThreads, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// Transform thread data for frontend
const transformThread = (item: any, currentUserId: string) => {
  // Only return threads where current user is a participant
  if (!item.participants || !item.participants.includes(currentUserId)) {
    return null;
  }

  return {
    id: item.id,
    subject: item.subject,
    participants: item.participants,
    participantNames: item.participantNames,
    lastMessage: item.lastMessage,
    messageCount: item.messageCount,
    unreadCount: item.unreadCount,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt
  };
};

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

    // Query threads where user is a participant using jsonb @> operator
    const threads = await db.select().from(messageThreads).where(
      sql`${messageThreads.participants}::jsonb @> ${JSON.stringify([userId])}::jsonb`
    );

    console.log('Raw threads results:', threads.length);

    // Transform threads for frontend - with additional security check
    const transformedThreads = threads
      .map(item => transformThread(item, userId))
      .filter(thread => thread !== null)
      // Remove duplicates based on thread ID
      .filter((thread, index, self) =>
        index === self.findIndex(t => t!.id === thread!.id)
      )
      // Sort by most recent activity
      .sort((a, b) => new Date(b!.updatedAt).getTime() - new Date(a!.updatedAt).getTime());

    console.log('Final transformed threads:', transformedThreads.length);
    console.log('Sample thread data:', transformedThreads[0] ? {
      id: transformedThreads[0].id,
      unreadCount: transformedThreads[0].unreadCount,
      participants: transformedThreads[0].participants
    } : 'No threads');

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
