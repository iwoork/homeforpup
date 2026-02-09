import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../../lib/auth';

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

const REACTIONS_TABLE = process.env.REACTIONS_TABLE_NAME || 'homeforpup-reactions';

const VALID_REACTION_TYPES = ['like', 'heart', 'celebrate'];

interface ReactionItem {
  id: string;
  postId: string;
  userId: string;
  reactionType: string;
  createdAt: string;
}

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: REACTIONS_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: REACTIONS_TABLE,
          KeySchema: [
            { AttributeName: 'postId', KeyType: 'HASH' },
            { AttributeName: 'userId', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'postId', AttributeType: 'S' },
            { AttributeName: 'userId', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${REACTIONS_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/posts/[postId]/reactions - Get reaction counts and current user's reaction
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);
    const currentUserId = session?.user?.id || null;

    await ensureTableExists();

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: REACTIONS_TABLE,
        KeyConditionExpression: 'postId = :postId',
        ExpressionAttributeValues: {
          ':postId': postId,
        },
      })
    );

    const reactions = (result.Items || []) as ReactionItem[];

    // Count reactions by type
    const counts: Record<string, number> = {};
    let userReaction: string | null = null;

    for (const reaction of reactions) {
      counts[reaction.reactionType] = (counts[reaction.reactionType] || 0) + 1;
      if (currentUserId && reaction.userId === currentUserId) {
        userReaction = reaction.reactionType;
      }
    }

    return NextResponse.json({
      counts,
      total: reactions.length,
      userReaction,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/reactions - Add or update a reaction
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reactionType } = body;

    if (!reactionType || !VALID_REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json(
        { error: `reactionType must be one of: ${VALID_REACTION_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const reactionItem: ReactionItem = {
      id: `reaction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      postId,
      userId: session.user.id,
      reactionType,
      createdAt: now,
    };

    // PutCommand with postId + userId as key is idempotent - overwrites existing reaction
    await dynamodb.send(
      new PutCommand({
        TableName: REACTIONS_TABLE,
        Item: reactionItem,
      })
    );

    return NextResponse.json({
      message: 'Reaction added successfully',
      reaction: reactionItem,
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]/reactions - Remove the user's reaction
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    await ensureTableExists();

    await dynamodb.send(
      new DeleteCommand({
        TableName: REACTIONS_TABLE,
        Key: {
          postId,
          userId: session.user.id,
        },
      })
    );

    return NextResponse.json({
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
