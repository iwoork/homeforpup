import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { VeterinaryVisit } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

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
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';

// POST /api/dogs/[id]/vet-visits - Add vet visit
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const body = await request.json();

    // Get existing dog
    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const existingDog = getResult.Item as any;

    // Check if user has permission
    const access = await checkDogAccess(session.user.id, existingDog);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new vet visit
    const vetVisitId = uuidv4();
    const timestamp = new Date().toISOString();

    const newVetVisit: VeterinaryVisit = {
      id: vetVisitId,
      dogId: dogId,
      visitDate: body.visitDate,
      veterinarian: {
        name: body.veterinarian.name,
        clinic: body.veterinarian.clinic,
        phone: body.veterinarian.phone,
        email: body.veterinarian.email,
      },
      visitType: body.visitType,
      reason: body.reason,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      medications: body.medications || [],
      weight: body.weight,
      temperature: body.temperature,
      heartRate: body.heartRate,
      notes: body.notes,
      followUpRequired: body.followUpRequired || false,
      followUpDate: body.followUpDate,
      cost: body.cost,
      attachments: body.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update dog with new vet visit
    const existingVetVisits = existingDog.veterinaryVisits || [];
    const updatedVetVisits = [...existingVetVisits, newVetVisit];

    const updateCommand = new UpdateCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
      UpdateExpression: 'SET veterinaryVisits = :vetVisits, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':vetVisits': updatedVetVisits,
        ':updatedAt': timestamp,
      },
    });

    await docClient.send(updateCommand);

    return NextResponse.json({ vetVisit: newVetVisit }, { status: 201 });
  } catch (error) {
    console.error('Error adding vet visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/vet-visits - Get vet visits for dog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;

    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const result = await docClient.send(getCommand);
    if (!result.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const dog = result.Item as any;

    // Check if user has access
    const access = await checkDogAccess(session.user.id, dog);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const vetVisits = dog.veterinaryVisits || [];

    return NextResponse.json({ vetVisits });
  } catch (error) {
    console.error('Error fetching vet visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
