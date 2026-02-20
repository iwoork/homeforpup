import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { CreateKennelRequest, KennelsResponse } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { checkKennelCreationAllowed } from '@/lib/stripe/subscriptionGuard';
import { auth } from '@clerk/nextjs/server';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

// GET /api/kennels - List kennels with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('Kennels API - Unauthorized: No valid authentication');
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Please ensure you are logged in. If this issue persists, try logging out and logging back in.',
      }, { status: 401 });
    }

    console.log('Kennels API - Authenticated user:', userId);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const verified = searchParams.get('verified');
    const specialty = searchParams.get('specialty') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';

    // Build filter expression
    let filterExpression = '';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's kennels (owners or managers)
    filterExpression = 'contains(owners, :userId) OR contains(managers, :userId)';
    expressionAttributeValues[':userId'] = userId;

    if (search) {
      filterExpression += ' AND (contains(#name, :search) OR contains(description, :search) OR contains(businessName, :search))';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (verified !== null) {
      filterExpression += ' AND verified = :verified';
      expressionAttributeValues[':verified'] = verified === 'true';
    }

    if (specialty) {
      filterExpression += ' AND contains(specialties, :specialty)';
      expressionAttributeValues[':specialty'] = specialty;
    }

    if (city) {
      filterExpression += ' AND address.city = :city';
      expressionAttributeValues[':city'] = city;
    }

    if (state) {
      filterExpression += ' AND address.state = :state';
      expressionAttributeValues[':state'] = state;
    }

    const scanCommand = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit,
    });

    const result = await docClient.send(scanCommand);
    const kennels = (result.Items as any[]) || [];

    // Sort by updatedAt descending
    kennels.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const response: KennelsResponse = {
      kennels: kennels.slice(offset, offset + limit),
      total: kennels.length,
      hasMore: kennels.length > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching kennels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/kennels - Create new kennel
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription limits
    const guard = await checkKennelCreationAllowed(userId);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: 'Subscription limit reached', message: guard.reason, tier: guard.tier, currentCount: guard.currentCount, limit: guard.limit },
        { status: 403 }
      );
    }

    const body: CreateKennelRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address' },
        { status: 400 }
      );
    }

    const kennelId = uuidv4();
    const timestamp = new Date().toISOString();

    const kennel: any = {
      id: kennelId,
      name: body.name,
      description: body.description,
      businessName: body.businessName,
      website: body.website,
      phone: body.phone,
      email: body.email,
      address: body.address,
      facilities: body.facilities || {
        indoorSpace: false,
        outdoorSpace: false,
        exerciseArea: false,
        whelpingArea: false,
        quarantineArea: false,
        groomingArea: false,
        veterinaryAccess: false,
        climateControl: false,
        security: false,
        other: [],
      },
      capacity: body.capacity || {
        maxDogs: 10,
        maxLitters: 5,
        currentDogs: 0,
        currentLitters: 0,
      },
      owners: [userId],
      managers: [userId],
      createdBy: userId,
      status: 'active',
      verified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      photos: [],
      videos: [],
      specialties: body.specialties || [],
      socialMedia: body.socialMedia,
    };

    await docClient.send(new PutCommand({
      TableName: KENNELS_TABLE,
      Item: kennel,
    }));

    return NextResponse.json({ kennel }, { status: 201 });
  } catch (error) {
    console.error('Error creating kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
