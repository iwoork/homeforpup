import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, UpdateCommand, GetCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const ACTIVITIES_TABLE = process.env.ACTIVITIES_TABLE_NAME || 'homeforpup-activities';

// POST /api/activities/[id]/read - Mark activity as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: activityId } = await params;

    // First, get the activity to verify ownership
    const getCommand = new GetCommand({
      TableName: ACTIVITIES_TABLE,
      Key: { id: activityId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Verify the activity belongs to the authenticated user
    if (getResult.Item.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the activity to mark as read
    const updateCommand = new UpdateCommand({
      TableName: ACTIVITIES_TABLE,
      Key: { id: activityId },
      UpdateExpression: 'SET #read = :read',
      ExpressionAttributeNames: {
        '#read': 'read',
      },
      ExpressionAttributeValues: {
        ':read': true,
      },
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);

    return NextResponse.json({ 
      success: true, 
      activity: result.Attributes 
    });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark activity as read' },
      { status: 500 }
    );
  }
}
