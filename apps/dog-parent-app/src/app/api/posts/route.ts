import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth, currentUser } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  PutCommand,
  QueryCommand,
  ScanCommand,
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

const POSTS_TABLE = process.env.POSTS_TABLE_NAME || 'homeforpup-posts';

const VALID_POST_TYPES = ['litter', 'health', 'achievement', 'event', 'available', 'general'] as const;
type PostType = typeof VALID_POST_TYPES[number];

interface PostItem {
  id: string;
  authorId: string;
  authorName: string;
  breederId: string;
  kennelId: string;
  groupId?: string;
  title: string;
  content: string;
  postType: PostType;
  photos: string[];
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: POSTS_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: POSTS_TABLE,
          KeySchema: [
            { AttributeName: 'authorId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'authorId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'breederId', AttributeType: 'S' },
            { AttributeName: 'createdAt', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'breederId-createdAt-index',
              KeySchema: [
                { AttributeName: 'breederId', KeyType: 'HASH' },
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
      console.log(`Table ${POSTS_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/posts?breederId=[id] or GET /api/posts?groupId=[id] - Get posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');
    const groupId = searchParams.get('groupId');

    if (!breederId && !groupId) {
      return NextResponse.json(
        { error: 'breederId or groupId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const lastKey = searchParams.get('lastKey');

    await ensureTableExists();

    if (groupId) {
      // Query posts by groupId using Scan with filter (no GSI for groupId)
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const params: any = {
        TableName: POSTS_TABLE,
        FilterExpression: 'groupId = :groupId',
        ExpressionAttributeValues: {
          ':groupId': groupId,
        },
        Limit: limit,
      };

      if (lastKey) {
        params.ExclusiveStartKey = JSON.parse(decodeURIComponent(lastKey));
      }

      const result = await dynamodb.send(new ScanCommand(params));

      // Sort by createdAt descending since Scan doesn't guarantee order
      const posts = (result.Items || []).sort(
        (a, b) => new Date(b.createdAt as string).getTime() - new Date(a.createdAt as string).getTime()
      );

      return NextResponse.json({
        posts,
        lastKey: result.LastEvaluatedKey
          ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
          : null,
        count: posts.length,
      });
    }

    // Query posts by breederId using GSI
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const params: any = {
      TableName: POSTS_TABLE,
      IndexName: 'breederId-createdAt-index',
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

    return NextResponse.json({
      posts: result.Items || [],
      lastKey: result.LastEvaluatedKey
        ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey))
        : null,
      count: result.Count || 0,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const body = await request.json();
    const { breederId, kennelId, groupId, title, content, postType, photos, tags } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    if (!postType || !VALID_POST_TYPES.includes(postType)) {
      return NextResponse.json(
        { error: `postType is required and must be one of: ${VALID_POST_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const postItem: PostItem = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: userId,
      authorName:
        clerkUser?.fullName || clerkUser?.firstName || 'Anonymous',
      breederId: String(breederId || ''),
      kennelId: String(kennelId || ''),
      groupId: groupId ? String(groupId) : undefined,
      title: (title || '').trim(),
      content: content.trim(),
      postType: postType as PostType,
      photos: Array.isArray(photos) ? photos : [],
      tags: Array.isArray(tags) ? tags : [],
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: POSTS_TABLE,
        Item: postItem,
      })
    );

    return NextResponse.json({
      message: 'Post created successfully',
      post: postItem,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
