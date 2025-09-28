import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

// Configure AWS SDK v3
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const FAVORITES_TABLE = process.env.FAVORITES_TABLE_NAME || 'homeforpup-favorites';

// GET /api/favorites/check - Check if a puppy is favorited by the user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const puppyId = searchParams.get('puppyId');

    if (!puppyId) {
      return NextResponse.json({ error: 'Puppy ID is required' }, { status: 400 });
    }

    const params = {
      TableName: FAVORITES_TABLE,
      Key: {
        userId,
        puppyId
      }
    };

    const result = await dynamodb.send(new GetCommand(params));

    return NextResponse.json({
      isFavorited: !!result.Item,
      favorite: result.Item || null
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

// POST /api/favorites/check - Check multiple puppies at once
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { puppyIds } = await request.json();

    if (!Array.isArray(puppyIds)) {
      return NextResponse.json({ error: 'Puppy IDs must be an array' }, { status: 400 });
    }

    // Check each puppy individually (DynamoDB doesn't have a batch get for different partition keys)
    const results = await Promise.all(
      puppyIds.map(async (puppyId: string) => {
        const params = {
          TableName: FAVORITES_TABLE,
          Key: {
            userId,
            puppyId
          }
        };

        const result = await dynamodb.send(new GetCommand(params));
        return {
          puppyId,
          isFavorited: !!result.Item,
          favorite: result.Item || null
        };
      })
    );

    // Convert to object for easier lookup
    const favoriteStatus = results.reduce((acc, result) => {
      acc[result.puppyId] = result.isFavorited;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      favoriteStatus,
      results
    });

  } catch (error) {
    console.error('Error checking favorite statuses:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite statuses' },
      { status: 500 }
    );
  }
}
