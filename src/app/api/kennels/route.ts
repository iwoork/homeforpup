import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
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

const docClient = DynamoDBDocumentClient.from(client);
const KENNELS_TABLE = 'homeforpup-kennels';

// GET /api/kennels - Get kennels for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;

    // Filter kennels where user is owner, manager, or creator
    const params = {
      TableName: KENNELS_TABLE,
      FilterExpression: 'ownerId = :userId OR createdBy = :userId OR contains(owners, :userId) OR contains(managers, :userId)',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    };

    const result = await docClient.send(new ScanCommand(params));
    return NextResponse.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching kennels:', error);
    return NextResponse.json({ error: 'Failed to fetch kennels' }, { status: 500 });
  }
}

// POST /api/kennels - Create a new kennel
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const body = await request.json();

    const {
      name,
      description,
      address,
      website,
      phone,
      email,
      specialties = [],
      establishedDate,
      licenseNumber,
      businessType = 'hobby',
      photoUrl,
      coverPhoto,
      galleryPhotos = [],
      isActive = true,
      isPublic = true,
      socialLinks = {},
      totalLitters = 0,
      totalDogs = 0,
      averageLitterSize = 0,
    } = body;

    if (!name) {
      return NextResponse.json({ error: 'Kennel name is required' }, { status: 400 });
    }

    const kennelId = uuidv4();
    const now = new Date().toISOString();

    const kennel = {
      id: kennelId,
      ownerId: userId, // Legacy field for backward compatibility
      owners: [userId], // New array field for multiple owners
      managers: [userId], // User is also a manager
      createdBy: userId,
      name,
      description,
      address,
      website,
      phone,
      email,
      specialties,
      establishedDate,
      licenseNumber,
      businessType,
      photoUrl,
      coverPhoto,
      galleryPhotos,
      isActive,
      isPublic,
      socialLinks,
      totalLitters,
      totalDogs,
      averageLitterSize,
      createdAt: now,
      updatedAt: now,
    };

    const params = {
      TableName: KENNELS_TABLE,
      Item: kennel,
    };

    await docClient.send(new PutCommand(params));
    return NextResponse.json(kennel, { status: 201 });
  } catch (error) {
    console.error('Error creating kennel:', error);
    return NextResponse.json({ error: 'Failed to create kennel' }, { status: 500 });
  }
}
