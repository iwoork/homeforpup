import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib';
import { CreateDogRequest, DogsResponse, DogFilter } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

// GET /api/dogs - List dogs with filtering
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
    const type = searchParams.get('type') || '';
    const gender = searchParams.get('gender') || '';
    const breed = searchParams.get('breed') || '';
    const status = searchParams.get('status') || '';
    const breedingStatus = searchParams.get('breedingStatus') || '';

    // Build filter expression
    let filterExpression = '';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's kennels
    filterExpression = 'contains(kennelOwners, :userId)';
    expressionAttributeValues[':userId'] = session.user.id;

    if (search) {
      filterExpression += ' AND (contains(#name, :search) OR contains(callName, :search) OR contains(breed, :search))';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    if (kennelId) {
      filterExpression += ' AND kennelId = :kennelId';
      expressionAttributeValues[':kennelId'] = kennelId;
    }

    if (type) {
      filterExpression += ' AND #type = :type';
      expressionAttributeNames['#type'] = 'type';
      expressionAttributeValues[':type'] = type;
    }

    if (gender) {
      filterExpression += ' AND gender = :gender';
      expressionAttributeValues[':gender'] = gender;
    }

    if (breed) {
      filterExpression += ' AND breed = :breed';
      expressionAttributeValues[':breed'] = breed;
    }

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (breedingStatus) {
      filterExpression += ' AND breeding.breedingStatus = :breedingStatus';
      expressionAttributeValues[':breedingStatus'] = breedingStatus;
    }

    const scanCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: filterExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined,
      Limit: limit,
    });

    const result = await docClient.send(scanCommand);
    const dogs = (result.Items as any[]) || [];

    // Sort by updatedAt descending
    dogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const response: DogsResponse = {
      dogs: dogs.slice(offset, offset + limit),
      total: dogs.length,
      hasMore: dogs.length > offset + limit,
    };

    return NextResponse.json(response);
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

    const body: CreateDogRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.breed || !body.gender || !body.birthDate || !body.kennelId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, breed, gender, birthDate, kennelId' },
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

    const dogId = uuidv4();
    const timestamp = new Date().toISOString();

    const dog: any = {
      id: dogId,
      name: body.name,
      callName: body.callName,
      breed: body.breed,
      gender: body.gender,
      birthDate: body.birthDate,
      type: body.type,
      color: body.color,
      markings: body.markings,
      weight: body.weight,
      height: body.height,
      eyeColor: body.eyeColor,
      kennelId: body.kennelId,
      kennelName: kennel.name,
      sireId: body.sireId,
      damId: body.damId,
      health: {
        healthClearances: [],
        vaccinations: [],
        medicalHistory: [],
        currentHealthStatus: 'excellent',
      },
      breeding: {
        isBreedingDog: body.type === 'parent',
        breedingStatus: body.type === 'parent' ? 'available' : 'too_young',
        breedingHistory: [],
        geneticTests: [],
      },
      status: 'active',
      createdAt: timestamp,
      updatedAt: timestamp,
      photos: [],
      videos: [],
      temperament: body.temperament,
      specialNeeds: body.specialNeeds,
      notes: body.notes,
    };

    await docClient.send(new PutCommand({
      TableName: DOGS_TABLE,
      Item: {
        ...dog,
        kennelOwners: kennel.owners, // For filtering by user's kennels
      },
    }));

    // Update kennel dog count
    const updateKennelCommand = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: 'id = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': body.kennelId,
      },
    });

    // This would need to be an UpdateCommand in a real implementation
    // For now, we'll just return the created dog

    return NextResponse.json({ dog }, { status: 201 });
  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
