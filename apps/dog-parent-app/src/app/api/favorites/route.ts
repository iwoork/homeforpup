import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { 
  DynamoDBDocumentClient, 
  PutCommand, 
  DeleteCommand, 
  QueryCommand
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../lib/auth';

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

interface FavoriteItem {
  userId: string;
  puppyId: string;
  GSI1PK: string; // For querying by puppyId
  createdAt: string;
  puppyData?: any; // Store some puppy data for quick access
}

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const lastKey = searchParams.get('lastKey');

    const params = {
      TableName: FAVORITES_TABLE,
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      Limit: limit,
      ScanIndexForward: false, // Most recent first
      ...(lastKey && {
        ExclusiveStartKey: JSON.parse(decodeURIComponent(lastKey))
      })
    };

    const result = await dynamodb.send(new QueryCommand(params));

    return NextResponse.json({
      favorites: result.Items || [],
      lastKey: result.LastEvaluatedKey ? encodeURIComponent(JSON.stringify(result.LastEvaluatedKey)) : null,
      count: result.Count || 0
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a puppy to favorites
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const { puppyId, puppyData } = await request.json();

    if (!puppyId) {
      return NextResponse.json({ error: 'Puppy ID is required' }, { status: 400 });
    }

    const favoriteItem: FavoriteItem = {
      userId,
      puppyId,
      GSI1PK: `FAVORITE#${puppyId}`, // For querying by puppyId
      createdAt: new Date().toISOString(),
      puppyData: puppyData || null
    };

    const params = {
      TableName: FAVORITES_TABLE,
      Item: favoriteItem
    };

    await dynamodb.send(new PutCommand(params));

    return NextResponse.json({ 
      message: 'Added to favorites',
      favorite: favoriteItem 
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a puppy from favorites
export async function DELETE(request: NextRequest) {
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

    await dynamodb.send(new DeleteCommand(params));

    return NextResponse.json({ 
      message: 'Removed from favorites' 
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
