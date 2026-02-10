import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const USERS_TABLE =
  process.env.USERS_TABLE_NAME ||
  process.env.PROFILES_TABLE_NAME ||
  'homeforpup-profiles';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    // Validate required fields
    const required = ['activityLevel', 'livingSpace', 'familySize', 'experienceLevel'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const matchPreferences = {
      activityLevel: body.activityLevel,
      livingSpace: body.livingSpace,
      familySize: body.familySize,
      childrenAges: body.childrenAges || [],
      experienceLevel: body.experienceLevel,
      size: body.size || [],
      updatedAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        UpdateExpression: 'SET matchPreferences = :prefs, updatedAt = :now',
        ExpressionAttributeValues: {
          ':prefs': matchPreferences,
          ':now': new Date().toISOString(),
        },
      })
    );

    return NextResponse.json({
      matchPreferences,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving match preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to save preferences',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    const result = await dynamodb.send(
      new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId },
        ProjectionExpression: 'matchPreferences',
      })
    );

    return NextResponse.json({
      matchPreferences: result.Item?.matchPreferences || null,
    });
  } catch (error) {
    console.error('Error fetching match preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
