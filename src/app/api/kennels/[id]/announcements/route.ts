import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWTEnhanced } from '@/lib';
import { v4 as uuidv4 } from 'uuid';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const ANNOUNCEMENTS_TABLE = 'homeforpup-kennel-announcements';

// GET /api/kennels/[id]/announcements - Get announcements for a specific kennel
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kennelId } = await context.params;
    
    const params = {
      TableName: ANNOUNCEMENTS_TABLE,
      FilterExpression: 'kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': kennelId,
      },
    };

    const result = await docClient.send(new ScanCommand(params));
    return NextResponse.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching kennel announcements:', error);
    return NextResponse.json({ error: 'Failed to fetch announcements' }, { status: 500 });
  }
}

// POST /api/kennels/[id]/announcements - Create a new announcement for a kennel
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const { userId } = await verifyJWTEnhanced(token);
    const { id: kennelId } = await context.params;
    const body = await request.json();

    const {
      title,
      content,
      type = 'general',
      photos = [],
      videos = [],
      litterId,
      breed,
      availablePuppies,
      priceRange,
      eventDate,
      eventLocation,
      isPublished = true,
      isPinned = false,
      tags = [],
    } = body;

    if (!title || !content) {
      return NextResponse.json({ error: 'Title and content are required' }, { status: 400 });
    }

    const announcementId = uuidv4();
    const now = new Date().toISOString();

    const announcement = {
      id: announcementId,
      kennelId,
      authorId: userId,
      title,
      content,
      type,
      photos,
      videos,
      litterId,
      breed,
      availablePuppies,
      priceRange,
      eventDate,
      eventLocation,
      isPublished,
      isPinned,
      publishedAt: isPublished ? now : undefined,
      views: 0,
      likes: 0,
      shares: 0,
      tags,
      createdAt: now,
      updatedAt: now,
    };

    const params = {
      TableName: ANNOUNCEMENTS_TABLE,
      Item: announcement,
    };

    await docClient.send(new PutCommand(params));
    return NextResponse.json(announcement, { status: 201 });
  } catch (error) {
    console.error('Error creating kennel announcement:', error);
    return NextResponse.json({ error: 'Failed to create announcement' }, { status: 500 });
  }
}
