import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';

// GET /api/dogs - List dogs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = (session.user as any).id;
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || '';
    const breedingStatus = searchParams.get('breedingStatus') || '';

    // Build filter expression
    let filterExpression = 'ownerId = :ownerId';
    const expressionAttributeValues: Record<string, any> = {
      ':ownerId': userId,
    };

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeValues[':status'] = status;
    }

    if (breedingStatus) {
      filterExpression += ' AND breedingStatus = :breedingStatus';
      expressionAttributeValues[':breedingStatus'] = breedingStatus;
    }

    const scanCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: status ? { '#status': 'status' } : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await docClient.send(scanCommand);
    const dogs = (result.Items as any[]) || [];

    // Sort by updatedAt descending
    dogs.sort((a, b) => new Date(b.updatedAt || 0).getTime() - new Date(a.updatedAt || 0).getTime());

    return NextResponse.json(dogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/dogs - Create new dog
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    // Validate required fields
    if (!body.name || !body.breed || !body.gender || !body.birthDate) {
      return NextResponse.json(
        { error: 'Missing required fields: name, breed, gender, birthDate' },
        { status: 400 }
      );
    }

    const dogId = uuidv4();
    const timestamp = new Date().toISOString();

    const dog: any = {
      id: dogId,
      ownerId: (session.user as any).id,
      name: body.name,
      breed: body.breed,
      gender: body.gender,
      birthDate: body.birthDate,
      color: body.color || '',
      weight: body.weight || 0,
      description: body.description || '',
      healthTests: [],
      breedingStatus: body.breedingStatus || 'not_ready',
      healthStatus: 'excellent',
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    await docClient.send(new PutCommand({
      TableName: DOGS_TABLE,
      Item: dog,
    }));

    return NextResponse.json({ dog }, { status: 201 });
  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
