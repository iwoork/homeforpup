// src/app/api/messages/send/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, TransactWriteCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWT } from '@/lib';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK v3 with removeUndefinedValues option
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Configure DynamoDB Document Client to remove undefined values
const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true, // This will fix the error
    convertEmptyValues: false,
    convertClassInstanceToMap: false,
  },
});

const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'homeforpup-messages';
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'homeforpup-message-threads';
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

// Helper function to get user info from users table
async function getUserInfo(userId: string) {
  try {
    const result = await dynamodb.send(new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId: userId }
    }));
    
    if (result.Item) {
      return {
        name: result.Item.displayName || result.Item.name || result.Item.firstName || 'Unknown User',
        displayName: result.Item.displayName || null,
        profileImage: result.Item.profileImage || null,
        userType: result.Item.userType || 'adopter'
      };
    }
    
    // Fallback: return basic info with truncated user ID
    return {
      name: `User ${userId.slice(-4)}`,
      displayName: null,
      profileImage: null,
      userType: 'adopter'
    };
  } catch (error) {
    console.error('Error fetching user info:', error);
    return {
      name: `User ${userId.slice(-4)}`,
      displayName: null,
      profileImage: null,
      userType: 'adopter'
    };
  }
}

// Helper function to clean undefined values from objects
function cleanUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(cleanUndefinedValues).filter(item => item !== undefined);
  }
  
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      if (value !== undefined) {
        cleaned[key] = cleanUndefinedValues(value);
      }
    }
    return cleaned;
  }
  
  return obj;
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

    // Security checks
    if (!authenticatedUserId) {
      return NextResponse.json({ error: 'Invalid user authentication' }, { status: 401 });
    }

    if (authenticatedUserId === recipientId) {
      return NextResponse.json({ error: 'Cannot send message to yourself' }, { status: 400 });
    }

    if (typeof recipientId !== 'string' || recipientId.trim().length === 0) {
      return NextResponse.json({ error: 'Invalid recipient ID' }, { status: 400 });
    }

    // Validate content length
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
      // For sender: get from database (JWT name might not be reliable)
      getUserInfo(authenticatedUserId),
      
      // For recipient: use provided name if valid, otherwise lookup in database
      (recipientName && recipientName !== 'Unknown User' && recipientName.trim() !== '') 
        ? Promise.resolve({
            name: recipientName,
            displayName: recipientName,
            profileImage: null,
            userType: 'adopter'
          })
        : getUserInfo(recipientId)
    ]);

    console.log('Resolved user info - Sender:', senderInfo.name, 'Receiver:', receiverInfo.name);

    const threadId = uuidv4();
    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create message with comprehensive user info - clean undefined values
    const message = cleanUndefinedValues({
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
      messageType: messageType || 'general'
    });

    const thread = cleanUndefinedValues({
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
      lastMessage: message,
      messageCount: 1,
      unreadCount: {
        [authenticatedUserId]: 0,
        [recipientId]: 1
      },
      createdAt: timestamp,
      updatedAt: timestamp
    });

    // Transaction to create both thread and message atomically
    const transactItems = [
      // Create message
      {
        Put: {
          TableName: MESSAGES_TABLE,
          Item: cleanUndefinedValues({
            PK: threadId,
            SK: messageId,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp,
            GSI2PK: recipientId,
            GSI2SK: timestamp,
            ...message
          })
        }
      },
      // Create main thread record
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: threadId,
            threadId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          })
        }
      },
      // Create participant record for sender
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: `${threadId}#${authenticatedUserId}`,
            threadId,
            participantId: authenticatedUserId,
            ...thread,
            GSI1PK: authenticatedUserId,
            GSI1SK: timestamp
          })
        }
      },
      // Create participant record for recipient
      {
        Put: {
          TableName: THREADS_TABLE,
          Item: cleanUndefinedValues({
            PK: `${threadId}#${recipientId}`,
            threadId,
            participantId: recipientId,
            ...thread,
            GSI1PK: recipientId,
            GSI1SK: timestamp
          })
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
      from: `${senderInfo.name} (${authenticatedUserId.substring(0, 10)}...)`,
      to: `${receiverInfo.name} (${recipientId.substring(0, 10)}...)`
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