import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const ACTIVITIES_TABLE = process.env.ACTIVITIES_TABLE_NAME || 'homeforpup-activities';

// POST /api/activities/mark-all-read - Mark all user activities as read
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // First, get all unread activities for the user
    const scanCommand = new ScanCommand({
      TableName: ACTIVITIES_TABLE,
      FilterExpression: 'userId = :userId AND #read = :read',
      ExpressionAttributeNames: {
        '#read': 'read',
      },
      ExpressionAttributeValues: {
        ':userId': userId,
        ':read': false,
      },
    });

    const scanResult = await docClient.send(scanCommand);
    const unreadActivities = scanResult.Items || [];

    // Update each unread activity
    const updatePromises = unreadActivities.map(activity => {
      const updateCommand = new UpdateCommand({
        TableName: ACTIVITIES_TABLE,
        Key: { id: activity.id },
        UpdateExpression: 'SET #read = :read',
        ExpressionAttributeNames: {
          '#read': 'read',
        },
        ExpressionAttributeValues: {
          ':read': true,
        },
      });

      return docClient.send(updateCommand);
    });

    await Promise.all(updatePromises);

    return NextResponse.json({ 
      success: true, 
      updatedCount: unreadActivities.length 
    });
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all activities as read' },
      { status: 500 }
    );
  }
}
