// src/app/api/messages/reply/route.ts
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

export async function POST(request: NextRequest) {
  try {
    // Get and verify JWT token
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const { userId, name: senderName } = await verifyJWT(token);
    const body = await request.json();
    const { threadId, content, receiverId, receiverName, subject } = body;

    if (!threadId || !content || !receiverId) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, content, receiverId' }, 
        { status: 400 }
      );
    }

    console.log('Sending reply to thread:', threadId, 'from:', userId, 'to:', receiverId);

    // Verify thread exists and user has access
    const threadCommand = new GetCommand({
      TableName: THREADS_TABLE,
      Key: { PK: `${threadId}#${userId}` }
    });

    const threadResult = await dynamodb.send(threadCommand);
    if (!threadResult.Item) {
      return NextResponse.json({ error: 'Thread not found or access denied' }, { status: 403 });
    }

    const messageId = uuidv4();
    const timestamp = new Date().toISOString();

    const message = {
      id: messageId,
      threadId,
      senderId: userId,
      senderName,
      receiverId,
      receiverName,
      subject: subject || `Re: ${threadResult.Item.subject}`,
      content,
      timestamp,
      read: false,
      messageType: 'general'
    };

    // Transaction to add message and update thread records
    const transactItems = [
      // Add new message
      {
        Put: {
          TableName: MESSAGES_TABLE,
          Item: {
            PK: threadId,
            SK: messageId,
            GSI1PK: userId,
            GSI1SK: timestamp,
            GSI2PK: receiverId,
            GSI2SK: timestamp,
            ...message
          }
        }
      },
      // Update main thread record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: threadId },
          UpdateExpression: 'SET lastMessage = :msg, messageCount = messageCount + :inc, updatedAt = :timestamp, unreadCount.#receiver = unreadCount.#receiver + :inc',
          ExpressionAttributeNames: {
            '#receiver': receiverId
          },
          ExpressionAttributeValues: {
            ':msg': message,
            ':inc': 1,
            ':timestamp': timestamp
          }
        }
      },
      // Update sender's participant record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: `${threadId}#${userId}` },
          UpdateExpression: 'SET lastMessage = :msg, messageCount = messageCount + :inc, updatedAt = :timestamp, GSI1SK = :timestamp',
          ExpressionAttributeValues: {
            ':msg': message,
            ':inc': 1,
            ':timestamp': timestamp
          }
        }
      },
      // Update receiver's participant record
      {
        Update: {
          TableName: THREADS_TABLE,
          Key: { PK: `${threadId}#${receiverId}` },
          UpdateExpression: 'SET lastMessage = :msg, messageCount = messageCount + :inc, updatedAt = :timestamp, GSI1SK = :timestamp, unreadCount.#receiver = unreadCount.#receiver + :inc',
          ExpressionAttributeNames: {
            '#receiver': receiverId
          },
          ExpressionAttributeValues: {
            ':msg': message,
            ':inc': 1,
            ':timestamp': timestamp
          }
        }
      }
    ];

    const command = new TransactWriteCommand({
      TransactItems: transactItems
    });

    await dynamodb.send(command);

    console.log('Reply sent successfully:', messageId);

    return NextResponse.json({ message }, { status: 201 });

  } catch (error) {
    console.error('Error sending reply:', error);
    return NextResponse.json(
      { 
        error: 'Failed to send reply',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      }, 
      { status: 500 }
    );
  }
}