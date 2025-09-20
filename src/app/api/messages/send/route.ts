// src/app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/utils/auth';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'puppy-platform-dev-messages';
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

export async function POST(request: NextRequest) {
  try {
    // Get and verify JWT token - this ensures sender identity
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify the JWT token and extract user info
    const { userId: authenticatedUserId, name: authenticatedUserName } = await verifyJWT(token);
    
    const body = await request.json();
    const { recipientId, recipientName, subject, content, messageType } = body;

    // Validate required fields
    if (!recipientId || !subject || !content) {
      return NextResponse.json(
        { error: 'Missing required fields: recipientId, subject, content' }, 
        { status: 400 }
      );
    }

    // Security check: prevent users from sending messages as someone else
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Invalid user authentication' }, { status: 401 });
    }

    // Prevent self-messaging
    if (authenticatedUserId === recipientId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    console.log('Creating new thread and message from authenticated user:', {
      senderId: authenticatedUserId,
      recipientId,
      subject: subject.substring(0, 50) + '...' // Log truncated subject for privacy
    });

    const threadId = uuidv4();
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Use authenticated user info (not client-provided data)
    const message = {
      id: messageId,
      threadId,
      senderId: authenticatedUserId, // Always use authenticated user ID
      senderName: authenticatedUserName, // Always use authenticated user name
      receiverId: recipientId,
      receiverName: recipientName,
      subject,
      content,
      timestamp,
      read: false,
      messageType: messageType || 'general'
    };

    const thread = {
      id: threadId,
      subject,
      participants: [authenticatedUserId, recipientId],
      participantNames: {
        [authenticatedUserId]: authenticatedUserName, // Use authenticated name
        [recipientId]: recipientName
      },
      lastMessage: message,
      messageCount: 1,
      unreadCount: {
        [authenticatedUserId]: 0, // Sender has read their own message
        [recipientId]: 1 // Recipient has 1 unread message
      },
      createdAt: timestamp,
      updatedAt: timestamp
    };

    // Transaction to create both thread and message atomically
    const transactItems = [
      // Create message
      {
        Put: {
          TableName: MESSAGES_TABLE,
          Item: {
            PK: threadId,
            SK: messageId,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp,
            GSI2PK: recipientId,
            GSI2SK: timestamp,
            ...message
          }
        }
      },
      // Create main thread record
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: {
            PK: threadId,
            threadId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          }
        }
      },
      // Create participant record for sender
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: {
            PK: `${threadId}#${authenticatedUserId}`,
            threadId,
            participantId: authenticatedUserId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          }
        }
      },
      // Create participant record for recipient
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: {
            PK: `${threadId}#${recipientId}`,
            threadId,
            participantId: recipientId,
            ...thread,
            GSI1PK: recipientId,
            GSI1SK: timestamp
          }
        }
      }
    ];

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await dynamodb.send(command);

    console.log('Thread and message created successfully:', {
      threadId,
      messageId,
      from: authenticatedUserId,
      to: recipientId
    });

    return NextResponse.json({ thread, message }, { status: 201 });

  } catch (error) {
    console.error('Error sending message:', error);
    
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
        error: 'Failed to send message',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}