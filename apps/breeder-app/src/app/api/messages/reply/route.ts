import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, eq, sql } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth, currentUser } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const body = await request.json();
    const { threadId, content, receiverId, receiverName, subject } = body;

    if (!threadId || !content || !receiverId) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, content, receiverId' },
        { status: 400 }
      );
    }

    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const senderName = clerkUser?.fullName || clerkUser?.firstName || '' || 'Unknown User';

    // Create the new message
    const newMessage = {
      id: messageId,
      threadId,
      senderId: userId,
      senderName,
      receiverId,
      receiverName: receiverName || 'Unknown User',
      content,
      subject: subject || 'Re: Message',
      messageType: 'general',
      read: false,
      timestamp,
      createdAt: timestamp,
    };

    // Save the message
    await db.insert(messages).values(newMessage);

    // Update the thread
    const [thread] = await db.select().from(messageThreads).where(eq(messageThreads.id, threadId)).limit(1);
    if (thread) {
      const unreadCount = (thread.unreadCount as Record<string, number>) || {};
      unreadCount[receiverId] = (unreadCount[receiverId] || 0) + 1;

      await db.update(messageThreads).set({
        lastMessage: {
          id: messageId,
          content,
          senderId: userId,
          senderName,
          messageType: 'general',
          timestamp
        },
        messageCount: (thread.messageCount || 0) + 1,
        updatedAt: timestamp,
        unreadCount,
      }).where(eq(messageThreads.id, threadId));
    }

    return NextResponse.json({
      message: 'Reply sent successfully',
      messageId,
      threadId
    });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
