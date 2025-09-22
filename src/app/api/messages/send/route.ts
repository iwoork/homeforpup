// src/app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
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
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'puppy-platform-dev-users';

// Helper function to get user name from users table
async function getUserName(userId: string): Promise<string> {
  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));
    
    if (result.Item) {
      // Try different name fields
      const name = result.Item.name || result.Item.firstName || result.Item.displayName;
      if (name && name.trim() !== '') {
        return name;
      }
    }
    
    // Fallback: return truncated user ID
    return `User ${userId.slice(-4)}`;
  } catch (error) {
    console.error('Error fetching user name:', error);
    return `User ${userId.slice(-4)}`;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get and verify JWT token - this ensures sender identity
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    // Verify the JWT token and extract user info
    let authenticatedUserId: string;
    let authenticatedUserNameFromJWT: string;
    
    try {
      const { userId, name } = await verifyJWT(token);
      authenticatedUserId = userId;
      authenticatedUserNameFromJWT = name;
      console.log('JWT verification successful for send message, user:', authenticatedUserId.substring(0, 10) + '...', 'name from JWT:', authenticatedUserNameFromJWT);
    } catch (verificationError) {
      console.error('JWT verification failed:', verificationError);
      return NextResponse.json({ 
        error: 'Invalid authentication token',
        details: process.env.NODE_ENV === 'development' ? String(verificationError) : undefined
      }, { status: 401 });
    }
    
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

    // Validate recipient ID format (basic check)
    if (typeof recipientId !== 'string' || recipientId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
    }

    // Validate content length
    if (content.length > 10000) { // 10KB limit
      return NextResponse.json({ error: 'Message content too long' }, { status: 400 });
    }

    if (subject.length > 200) { // 200 char limit for subject
      return NextResponse.json({ error: 'Subject too long' }, { status: 400 });
    }

    console.log('Creating new thread and message from authenticated user:', {
      senderId: authenticatedUserId.substring(0, 10) + '...',
      recipientId: recipientId.substring(0, 10) + '...',
      subject: subject.substring(0, 50) + '...' // Log truncated subject for privacy
    });

    // Get proper names for both sender and recipient
    const [senderName, receiverName] = await Promise.all([
      // For sender: try JWT name first, then lookup in database
      (authenticatedUserNameFromJWT && authenticatedUserNameFromJWT !== 'User' && authenticatedUserNameFromJWT.trim() !== '') 
        ? Promise.resolve(authenticatedUserNameFromJWT)
        : getUserName(authenticatedUserId),
      
      // For recipient: use provided name if valid, otherwise lookup in database
      (recipientName && recipientName !== 'Unknown User' && recipientName.trim() !== '') 
        ? Promise.resolve(recipientName)
        : getUserName(recipientId)
    ]);

    console.log('Resolved names - Sender:', senderName, 'Receiver:', receiverName);

    const threadId = uuidv4();
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Use authenticated user info with proper names
    const message = {
      id: messageId,
      threadId,
      senderId: authenticatedUserId, // Always use authenticated user ID
      senderName: senderName, // Use resolved sender name
      receiverId: recipientId,
      receiverName: receiverName, // Use resolved receiver name
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
        [authenticatedUserId]: senderName, // Use resolved sender name
        [recipientId]: receiverName // Use resolved receiver name
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
      from: `${senderName} (${authenticatedUserId.substring(0, 10)}...)`,
      to: `${receiverName} (${recipientId.substring(0, 10)}...)`
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