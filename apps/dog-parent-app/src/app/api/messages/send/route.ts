// src/app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, messages, messageThreads, profiles, eq } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// Helper function to get user info from profiles table
async function getUserInfo(userId: string) {
  try {
    const [result] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (result) {
      return {
        name: result.displayName || result.name || 'Unknown User',
        displayName: result.displayName || null,
        profileImage: result.profileImage || null,
        userType: result.userType || 'dog-parent'
      };
    }

    return {
      name: `User ${userId.slice(-4)}`,
      displayName: null,
      profileImage: null,
      userType: 'dog-parent'
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return {
      name: `User ${userId.slice(-4)}`,
      displayName: null,
      profileImage: null,
      userType: 'dog-parent'
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();

    if (!userId) {
      console.log('No valid session found for send message request');
      return NextResponse.json({
        error: 'Your session has expired. Please refresh the page to continue.',
        code: 'SESSION_EXPIRED'
      }, { status: 401 });
    }

    const authenticatedUserId = userId;

    const body = await request.json();
    const { recipientId, recipientName, subject, content, messageType } = body;

    // Validate required fields
    if (!recipientId || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, subject, content' },
        { status: 400 }
      );
    }

    // Security checks
    if (authenticatedUserId === recipientId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    if (typeof recipientId !== 'string' || recipientId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
    }

    if (content.length > 10000) {
      return NextResponse.json({ error: 'Message content too long' }, { status: 400 });
    }

    if (subject.length > 200) {
      return NextResponse.json({ error: 'Subject too long' }, { status: 400 });
    }

    console.log('Creating new thread and message from authenticated user:', {
      senderId: authenticatedUserId.substring(0, 10) + '...',
      recipientId: recipientId.substring(0, 10) + '...',
      subject: subject.substring(0, 50) + '...'
    });

    // Get comprehensive user info for both sender and recipient
    const [senderInfo, receiverInfo] = await Promise.all([
      getUserInfo(authenticatedUserId),
      (recipientName && recipientName !== 'Unknown User' && recipientName.trim() !== '')
        ? Promise.resolve({
            name: recipientName,
            displayName: recipientName,
            profileImage: null,
            userType: 'dog-parent'
          })
        : getUserInfo(recipientId)
    ]);

    console.log('Resolved user info - Sender:', senderInfo.name, 'Receiver:', receiverInfo.name);

    const threadId = uuidv4();
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create message
    const message = {
      id: messageId,
      threadId,
      senderId: authenticatedUserId,
      senderName: senderInfo.name,
      senderAvatar: senderInfo.profileImage,
      receiverId: recipientId,
      receiverName: receiverInfo.name,
      subject,
      content,
      timestamp,
      read: false,
      messageType: messageType || 'general',
      createdAt: timestamp,
    };

    const thread = {
      id: threadId,
      subject,
      participants: [authenticatedUserId, recipientId],
      participantNames: {
        [authenticatedUserId]: senderInfo.name,
        [recipientId]: receiverInfo.name
      },
      participantInfo: {
        [authenticatedUserId]: {
          name: senderInfo.name,
          displayName: senderInfo.displayName,
          profileImage: senderInfo.profileImage,
          userType: senderInfo.userType
        },
        [recipientId]: {
          name: receiverInfo.name,
          displayName: receiverInfo.displayName,
          profileImage: receiverInfo.profileImage,
          userType: receiverInfo.userType
        }
      },
      lastMessage: {
        id: messageId,
        content,
        senderId: authenticatedUserId,
        senderName: senderInfo.name,
        messageType: messageType || 'general',
        timestamp
      },
      messageCount: 1,
      unreadCount: {
        [authenticatedUserId]: 0,
        [recipientId]: 1
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Use a transaction to create both thread and message atomically
    await db.transaction(async (tx) => {
      await tx.insert(messageThreads).values(thread);
      await tx.insert(messages).values(message);
    });

    console.log('Thread and message created successfully:', {
      threadId,
      messageId,
      from: `${senderInfo.name} (${authenticatedUserId.substring(0, 10)}...)`,
      to: `${receiverInfo.name} (${recipientId.substring(0, 10)}...)`
    });

    return NextResponse.json({ thread, message }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);

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
        error: 'Failed to send message',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
