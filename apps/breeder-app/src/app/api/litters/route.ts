import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { CreateLitterRequest, LittersResponse, LitterFilter } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { checkLitterCreationAllowed } from '@/lib/stripe/subscriptionGuard';

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
const LITTERS_TABLE = process.env.LITTERS_TABLE_NAME || 'homeforpup-litters';
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';

// GET /api/litters - List litters with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const kennelId = searchParams.get('kennelId') || '';
    const status = searchParams.get('status') || '';
    const breed = searchParams.get('breed') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build filter expression
    let filterExpression = '';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's kennels
    filterExpression = 'contains(kennelOwners, :userId)';
    expressionAttributeValues[':userId'] = session.user.id;

    if (search) {
      filterExpression += ' AND (contains(#name, :search) OR contains(sireName, :search) OR contains(damName, :search))';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    if (kennelId) {
      filterExpression += ' AND kennelId = :kennelId';
      expressionAttributeValues[':kennelId'] = kennelId;
    }

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (breed) {
      filterExpression += ' AND breed = :breed';
      expressionAttributeValues[':breed'] = breed;
    }

    if (startDate) {
      filterExpression += ' AND birthDate >= :startDate';
      expressionAttributeValues[':startDate'] = startDate;
    }

    if (endDate) {
      filterExpression += ' AND birthDate <= :endDate';
      expressionAttributeValues[':endDate'] = endDate;
    }

    const scanCommand = new ScanCommand({
      TableName: LITTERS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit,
    });

    const result = await docClient.send(scanCommand);
    const litters = (result.Items as any[]) || [];

    // Sort by birthDate descending
    litters.sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime());

    const response: LittersResponse = {
      litters: litters.slice(offset, offset + limit),
      total: litters.length,
      hasMore: litters.length > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching litters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/litters - Create new litter
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription limits
    const guard = await checkLitterCreationAllowed(session.user.id);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: 'Subscription limit reached', message: guard.reason, tier: guard.tier, currentCount: guard.currentCount, limit: guard.limit },
        { status: 403 }
      );
    }

    const body: CreateLitterRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.kennelId || !body.sireId || !body.damId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, kennelId, sireId, damId' },
        { status: 400 }
      );
    }

    // Verify user has access to the kennel
    const kennelCommand = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: 'id = :kennelId AND (contains(owners, :userId) OR contains(managers, :userId))',
      ExpressionAttributeValues: {
        ':kennelId': body.kennelId,
        ':userId': session.user.id,
      },
    });

    const kennelResult = await docClient.send(kennelCommand);
    if (!kennelResult.Items || kennelResult.Items.length === 0) {
      return NextResponse.json({ error: 'Kennel not found or access denied' }, { status: 404 });
    }

    const kennel = kennelResult.Items[0] as any;

    // Verify sire and dam exist and belong to the kennel
    const dogsCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: 'id IN (:sireId, :damId) AND kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':sireId': body.sireId,
        ':damId': body.damId,
        ':kennelId': body.kennelId,
      },
    });

    const dogsResult = await docClient.send(dogsCommand);
    if (!dogsResult.Items || dogsResult.Items.length !== 2) {
      return NextResponse.json({ error: 'Sire and dam must exist and belong to the kennel' }, { status: 400 });
    }

    const sire = dogsResult.Items.find(dog => dog.id === body.sireId);
    const dam = dogsResult.Items.find(dog => dog.id === body.damId);

    if (!sire || !dam) {
      return NextResponse.json({ error: 'Sire and dam not found' }, { status: 404 });
    }

    if (sire.gender !== 'male' || dam.gender !== 'female') {
      return NextResponse.json({ error: 'Sire must be male and dam must be female' }, { status: 400 });
    }

    const litterId = uuidv4();
    const timestamp = new Date().toISOString();

    const litter: any = {
      id: litterId,
      name: body.name,
      kennelId: body.kennelId,
      kennelName: kennel.name,
      sireId: body.sireId,
      sireName: sire.name,
      damId: body.damId,
      damName: dam.name,
      birthDate: body.expectedBirthDate || new Date().toISOString(),
      expectedPuppyCount: body.expectedPuppyCount,
      actualPuppyCount: 0,
      puppies: [],
      status: body.expectedBirthDate ? 'expected' : 'born',
      health: {
        whelpingComplications: undefined,
        vetCheckDate: undefined,
        vetNotes: undefined,
        vaccinationsStarted: false,
        dewormingStarted: false,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: body.notes,
    };

    await docClient.send(new PutCommand({
      TableName: LITTERS_TABLE,
      Item: {
        ...litter,
        kennelOwners: kennel.owners, // For filtering by user's kennels
        breed: sire.breed, // For filtering by breed
      },
    }));

    return NextResponse.json({ litter }, { status: 201 });
  } catch (error) {
    console.error('Error creating litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
