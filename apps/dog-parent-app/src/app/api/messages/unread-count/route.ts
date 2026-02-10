import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ unreadCount: 0 }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Query threads where user is a participant using GSI1
    const command = new QueryCommand({
      TableName: THREADS_TABLE,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const result = await dynamodb.send(command);
    const items = result.Items || [];

    // Filter to participant records and sum unread counts
    const totalUnread = items
      .filter(item => item.PK?.includes('#') && item.PK?.includes(userId))
      .reduce((total, item) => {
        const threadUnread = item.unreadCount?.[userId] || 0;
        return total + threadUnread;
      }, 0);

    return NextResponse.json({ unreadCount: totalUnread });
  } catch (error) {
    console.error('Error fetching unread count:', error);
    return NextResponse.json({ unreadCount: 0 }, { status: 500 });
  }
}
