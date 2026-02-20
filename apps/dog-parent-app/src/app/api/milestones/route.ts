import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';

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

const MILESTONES_TABLE = process.env.MILESTONES_TABLE_NAME || 'homeforpup-milestones';

const VALID_MILESTONE_TYPES = ['weight', 'health', 'training', 'social', 'first'] as const;
type MilestoneType = typeof VALID_MILESTONE_TYPES[number];

interface MilestoneItem {
  id: string;
  litterId: string;
  breederId: string;
  title: string;
  description: string;
  milestoneType: MilestoneType;
  date: string;
  photos: string[];
  createdAt: string;
}

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: MILESTONES_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: MILESTONES_TABLE,
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
      console.log(`Table ${MILESTONES_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/milestones?litterId=[id] - Get milestones for a litter sorted by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const litterId = searchParams.get('litterId');

    if (!litterId) {
      return NextResponse.json(
        { error: 'litterId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const lastKey = searchParams.get('lastKey');

    await ensureTableExists();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      TableName: MILESTONES_TABLE,
      KeyConditionExpression: 'litterId = :litterId',
      ExpressionAttributeValues: {
        ':litterId': litterId,
      },
      Limit: limit,
      ScanIndexForward: true,
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    }

    const result = await dynamodb.send(new QueryCommand(params));

    // Sort by date ascending for timeline display
    const milestones = (result.Items || []).sort(
      (a, b) => new Date(a.date as string).getTime() - new Date(b.date as string).getTime()
    );

    return NextResponse.json({
      milestones,
      lastKey: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
      count: milestones.length,
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST /api/milestones - Create a new milestone
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { litterId, breederId, title, description, milestoneType, date, photos } = body;

    // Validate required fields
    if (!litterId || typeof litterId !== 'string' || litterId.trim().length === 0) {
      return NextResponse.json(
        { error: 'litterId is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'date is required' },
        { status: 400 }
      );
    }

    if (milestoneType && !VALID_MILESTONE_TYPES.includes(milestoneType)) {
      return NextResponse.json(
        { error: `milestoneType must be one of: ${VALID_MILESTONE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const milestoneItem: MilestoneItem = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      litterId: litterId.trim(),
      breederId: String(breederId || ''),
      title: title.trim(),
      description: (description || '').trim(),
      milestoneType: (milestoneType || 'first') as MilestoneType,
      date,
      photos: Array.isArray(photos) ? photos : [],
      createdAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: MILESTONES_TABLE,
        Item: milestoneItem,
      })
    );

    return NextResponse.json({
      message: 'Milestone created successfully',
      milestone: milestoneItem,
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
