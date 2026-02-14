import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { TrainingRecord } from '@homeforpup/shared-types';
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

// POST /api/dogs/[id]/training - Add training record
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

    // Create new training record
    const trainingId = uuidv4();
    const timestamp = new Date().toISOString();

    const newTraining: TrainingRecord = {
      id: trainingId,
      dogId: dogId,
      sessionDate: body.sessionDate,
      trainer: body.trainer ? {
        name: body.trainer.name,
        credentials: body.trainer.credentials,
        contact: body.trainer.contact,
      } : undefined,
      trainingType: body.trainingType,
      customTrainingType: body.customTrainingType,
      skills: body.skills || [],
      duration: body.duration,
      location: body.location,
      notes: body.notes,
      progress: body.progress,
      nextSessionDate: body.nextSessionDate,
      attachments: body.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update dog with new training record
    const existingTraining = existingDog.trainingRecords || [];
    const updatedTraining = [...existingTraining, newTraining];

    const updateCommand = new UpdateCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
      UpdateExpression: 'SET trainingRecords = :training, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':training': updatedTraining,
        ':updatedAt': timestamp,
      },
    });

    await docClient.send(updateCommand);

    return NextResponse.json({ training: newTraining }, { status: 201 });
  } catch (error) {
    console.error('Error adding training record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/training - Get training records for dog
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

    const trainingRecords = dog.trainingRecords || [];

    return NextResponse.json({ trainingRecords });
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
