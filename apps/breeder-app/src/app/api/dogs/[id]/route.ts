import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateDogRequest } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';

// GET /api/dogs/[id] - Get dog details
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

    const dog = result.Item as any; // Using any to handle kennelOwners property

    // Check if user has access to this dog's kennel
    if (!dog.kennelOwners?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ dog });
  } catch (error) {
    console.error('Error fetching dog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/dogs/[id] - Update dog
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const body: UpdateDogRequest = await request.json();

    // Get existing dog
    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const existingDog = getResult.Item as any; // Using any to handle kennelOwners property

    // Check if user has permission to update
    if (!existingDog.kennelOwners?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build update expression
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {
      ':updatedAt': new Date().toISOString(),
    };

    // Add fields to update
    const fieldsToUpdate = [
      'name', 'breed', 'gender', 'birthDate',
      'color', 'weight', 'description',
      'sireId', 'damId'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field as keyof UpdateDogRequest] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field as keyof UpdateDogRequest];
      }
    });

    // Handle type field mapping to dogType
    if (body.type !== undefined) {
      updateExpression += `, #dogType = :dogType`;
      expressionAttributeNames[`#dogType`] = 'dogType';
      expressionAttributeValues[`:dogType`] = body.type;
      
      // Also update breedingStatus based on type
      updateExpression += `, #breedingStatus = :breedingStatus`;
      expressionAttributeNames[`#breedingStatus`] = 'breedingStatus';
      expressionAttributeValues[`:breedingStatus`] = body.type === 'parent' ? 'available' : 'not_ready';
    }

    const updateCommand = new UpdateCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);
    const updatedDog = result.Attributes as any;

    return NextResponse.json({ dog: updatedDog });
  } catch (error) {
    console.error('Error updating dog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/dogs/[id] - Delete dog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;

    // Get existing dog
    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const existingDog = getResult.Item as any; // Using any to handle kennelOwners property

    // Check if user has permission to delete
    if (!existingDog.kennelOwners?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if dog is a parent in any litters
    if (existingDog.type === 'parent') {
      // This would need to check for litters where this dog is sire or dam
      // For now, we'll allow deletion but in production you'd want to check this
    }

    // Delete dog
    await docClient.send(new DeleteCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    }));

    return NextResponse.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
