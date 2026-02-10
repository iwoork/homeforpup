import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  PutCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

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

const WAITLIST_TABLE = process.env.WAITLIST_TABLE_NAME || 'homeforpup-waitlist';

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: WAITLIST_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: WAITLIST_TABLE,
          KeySchema: [
            { AttributeName: 'litterId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'litterId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${WAITLIST_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/litters/[litterId]/waitlist - Get waitlist entries for a litter
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ litterId: string }> }
) {
  try {
    const { litterId } = await context.params;

    await ensureTableExists();

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: WAITLIST_TABLE,
        KeyConditionExpression: 'litterId = :litterId',
        ExpressionAttributeValues: {
          ':litterId': litterId,
        },
      })
    );

    const entries = (result.Items || []).sort(
      (a, b) => (a.position as number) - (b.position as number)
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// POST /api/litters/[litterId]/waitlist - Add a new waitlist entry
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ litterId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId } = await context.params;
    const body = await request.json();

    if (!body.buyerName || !body.buyerEmail) {
      return NextResponse.json(
        { error: 'buyerName and buyerEmail are required' },
        { status: 400 }
      );
    }

    await ensureTableExists();

    // Get current entries to determine next position
    const existing = await dynamodb.send(
      new QueryCommand({
        TableName: WAITLIST_TABLE,
        KeyConditionExpression: 'litterId = :litterId',
        ExpressionAttributeValues: {
          ':litterId': litterId,
        },
      })
    );

    const maxPosition = (existing.Items || []).reduce(
      (max, item) => Math.max(max, (item.position as number) || 0),
      0
    );

    const entry = {
      id: uuidv4(),
      litterId,
      breederId: session.user.id,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      buyerPhone: body.buyerPhone,
      position: maxPosition + 1,
      status: body.status || 'active',
      depositAmount: body.depositAmount,
      depositPaid: body.depositPaid || false,
      genderPreference: body.genderPreference,
      colorPreference: body.colorPreference,
      notes: body.notes,
      createdAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: WAITLIST_TABLE,
        Item: entry,
      })
    );

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to create waitlist entry' },
      { status: 500 }
    );
  }
}
