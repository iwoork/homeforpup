import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  DeleteCommand,
} from '@aws-sdk/lib-dynamodb';
import { v4 as uuidv4 } from 'uuid';

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
  },
});

const DEVICE_TOKENS_TABLE = process.env.DEVICE_TOKENS_TABLE_NAME || 'homeforpup-device-tokens';

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: DEVICE_TOKENS_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: DEVICE_TOKENS_TABLE,
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' },
            { AttributeName: 'deviceToken', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'userId', AttributeType: 'S' },
            { AttributeName: 'deviceToken', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        }),
      );
      // Wait for table to become active
      await new Promise(resolve => setTimeout(resolve, 5000));
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// POST /api/notifications/register - Register a device token
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceToken, platform, deviceName } = body;

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const item = {
      userId: userId,
      deviceToken,
      platform: platform || 'ios',
      deviceName: deviceName || 'Unknown Device',
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: DEVICE_TOKENS_TABLE,
        Item: item,
      }),
    );

    return NextResponse.json({
      success: true,
      data: { registration: item },
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    return NextResponse.json(
      { error: 'Failed to register device token' },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications/register - Unregister a device token
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceToken = searchParams.get('deviceToken');

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    await ensureTableExists();

    await dynamodb.send(
      new DeleteCommand({
        TableName: DEVICE_TOKENS_TABLE,
        Key: {
          userId: userId,
          deviceToken,
        },
      }),
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering device token:', error);
    return NextResponse.json(
      { error: 'Failed to unregister device token' },
      { status: 500 },
    );
  }
}

// GET /api/notifications/register - Get registered device tokens for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTableExists();

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: DEVICE_TOKENS_TABLE,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId,
        },
      }),
    );

    return NextResponse.json({
      success: true,
      data: { tokens: result.Items || [] },
    });
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device tokens' },
      { status: 500 },
    );
  }
}
