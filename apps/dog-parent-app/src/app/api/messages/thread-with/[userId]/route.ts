import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
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

const THREADS_TABLE = process.env.THREADS_TABLE_NAME || 'puppy-platform-dev-message-threads';

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

    // Query threads where current user is a participant using GSI1
    const command = new QueryCommand({
      TableName: THREADS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :userId',
      ExpressionAttributeValues: {
        ':userId': currentUserId,
      },
    });

    const result = await dynamodb.send(command);
    const items = result.Items || [];

    // Find a thread where the other user is also a participant
    const matchingThread = items.find(item => {
      if (!item.PK?.includes('#')) return false;
      const participants = item.participants;
      if (!Array.isArray(participants)) return false;
      return participants.includes(otherUserId);
    });

    if (matchingThread) {
      // Extract threadId from participant record PK (format: threadId#participantId)
      const threadId = matchingThread.PK.split('#')[0];
      return NextResponse.json({
        exists: true,
        threadId,
        subject: matchingThread.subject || null,
      });
    }

    return NextResponse.json({ exists: false, threadId: null });
  } catch (error) {
    console.error('Error checking thread with user:', error);
    return NextResponse.json({ exists: false, threadId: null }, { status: 500 });
  }
}
