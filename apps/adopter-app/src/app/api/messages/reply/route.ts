import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
    convertEmptyValues: false,
    convertClassInstanceToMap: false,
  },
});

const MESSAGES_TABLE = process.env.MESSAGES_TABLE_NAME || 'puppy-platform-dev-messages';
const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

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
    const userId = session.user.id;

    // Create the new message with the correct DynamoDB structure
    const newMessage = {
      PK: threadId, // Partition key is threadId
      SK: messageId, // Sort key is messageId
      threadId,
      senderId: userId,
      senderName: session.user.name || 'Unknown User',
      receiverId,
      receiverName: receiverName || 'Unknown User',
      content,
      subject: subject || 'Re: Message',
      messageType: 'general',
      read: false,
      timestamp,
      createdAt: timestamp,
      updatedAt: timestamp,
      // GSI keys for querying by sender/receiver
      GSI1PK: userId, // senderId
      GSI1SK: timestamp,
      GSI2PK: receiverId, // receiverId
      GSI2SK: timestamp
    };

    // Save the message
    await dynamodb.send(new PutCommand({
      TableName: MESSAGES_TABLE,
      Item: newMessage
    }));

    // Update the thread participant records for both users
    const updatePromises = [userId, receiverId].map(participantId => 
      dynamodb.send(new UpdateCommand({
        TableName: THREADS_TABLE,
        Key: { PK: `${threadId}#${participantId}` },
        UpdateExpression: 'SET lastMessage = :lastMessage, messageCount = messageCount + :inc, updatedAt = :updatedAt, unreadCount.#receiverId = unreadCount.#receiverId + :inc',
        ExpressionAttributeNames: {
          '#receiverId': receiverId
        },
        ExpressionAttributeValues: {
          ':lastMessage': {
            id: messageId,
            content,
            senderId: userId,
            senderName: session.user.name || 'Unknown User',
            messageType: 'general',
            timestamp
          },
          ':inc': 1,
          ':updatedAt': timestamp
        }
      }))
    );

    await Promise.all(updatePromises);

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