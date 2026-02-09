import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

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

const REVIEWS_TABLE = process.env.REVIEWS_TABLE_NAME || 'homeforpup-reviews';

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: REVIEWS_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: REVIEWS_TABLE,
          KeySchema: [
            { AttributeName: 'breederId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'breederId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'reviewerId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'reviewerId-createdAt-index',
              KeySchema: [
                { AttributeName: 'reviewerId', KeyType: 'HASH' },
                { AttributeName: 'createdAt', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${REVIEWS_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

interface ReviewItem {
  id: string;
  breederId: string;
  reviewerId: string;
  reviewerName: string;
  rating: number;
  title: string;
  content: string;
  createdAt: string;
  updatedAt: string;
}

// GET /api/reviews?breederId=[id] - Get reviews for a breeder
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');

    if (!breederId) {
      return NextResponse.json(
        { error: 'breederId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const lastKey = searchParams.get('lastKey');

    await ensureTableExists();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      TableName: REVIEWS_TABLE,
      KeyConditionExpression: 'breederId = :breederId',
      ExpressionAttributeValues: {
        ':breederId': breederId,
      },
      Limit: limit,
      ScanIndexForward: false,
    };

    if (lastKey) {
      params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
    }

    const result = await dynamodb.send(new QueryCommand(params));

    // Sort by createdAt descending (since sort key is id, we sort in memory)
    const reviews = (result.Items || []).sort(
      (a, b) =>
        new Date(b.createdAt as string).getTime() -
        new Date(a.createdAt as string).getTime()
    );

    return NextResponse.json({
      reviews,
      lastKey: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
      count: result.Count || 0,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { breederId, rating, title, content } = body;

    // Validate required fields
    if (!breederId) {
      return NextResponse.json(
        { error: 'breederId is required' },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating is required and must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const reviewItem: ReviewItem = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      breederId: String(breederId),
      reviewerId: session.user.id,
      reviewerName:
        (session.user as Record<string, unknown>).displayName as string ||
        session.user.name ||
        'Anonymous',
      rating: Math.round(rating),
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: REVIEWS_TABLE,
        Item: reviewItem,
      })
    );

    return NextResponse.json({
      message: 'Review created successfully',
      review: reviewItem,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
