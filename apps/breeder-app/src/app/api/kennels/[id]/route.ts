import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { Kennel, UpdateKennelRequest, KennelResponse } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const LITTERS_TABLE = process.env.LITTERS_TABLE_NAME || 'homeforpup-litters';

// GET /api/kennels/[id] - Get kennel details with dogs and litters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;

    // Get kennel
    const kennelCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const kennelResult = await docClient.send(kennelCommand);
    if (!kennelResult.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    const kennel = kennelResult.Item as any; // Using any to handle kennel properties

    // Check if user has access to this kennel
    if (!kennel.owners.includes(session.user.id) && !kennel.managers.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get dogs in this kennel
    const dogsCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: 'kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': kennelId,
      },
    });

    const dogsResult = await docClient.send(dogsCommand);
    const dogs = (dogsResult.Items || []) as any[];

    // Get litters in this kennel
    const littersCommand = new ScanCommand({
      TableName: LITTERS_TABLE,
      FilterExpression: 'kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': kennelId,
      },
    });

    const littersResult = await docClient.send(littersCommand);
    const litters = (littersResult.Items || []) as any[];

    // Calculate stats
    const stats = {
      totalDogs: dogs.length,
      totalLitters: litters.length,
      totalPuppies: litters.reduce((sum, litter) => sum + (litter.actualPuppyCount || 0), 0),
      activeBreedingDogs: dogs.filter(dog => 
        dog.type === 'parent' && 
        dog.breeding?.isBreedingDog && 
        dog.breeding?.breedingStatus === 'available'
      ).length,
    };

    const response: KennelResponse = {
      kennel,
      dogs,
      litters,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/kennels/[id] - Update kennel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;
    const body: UpdateKennelRequest = await request.json();
    
    console.log('Received update request for kennel:', kennelId);
    console.log('Request body:', body);
    console.log('Facilities in request:', body.facilities);
    console.log('Specialties in request:', body.specialties);
    console.log('Specialties type:', typeof body.specialties);
    console.log('Is specialties array:', Array.isArray(body.specialties));

    // Get existing kennel
    const getCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    const existingKennel = getResult.Item as any; // Using any to handle kennel properties

    // Check if user has permission to update
    if (!existingKennel.owners.includes(session.user.id) && !existingKennel.managers.includes(session.user.id)) {
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
      'name', 'description', 'businessName', 'website', 'phone', 'email',
      'address', 'facilities', 'capacity', 'specialties', 'socialMedia'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field as keyof UpdateKennelRequest] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field as keyof UpdateKennelRequest];
      }
    });

    console.log('Update expression:', updateExpression);
    console.log('Expression attribute names:', expressionAttributeNames);
    console.log('Expression attribute values:', expressionAttributeValues);

    const updateCommand = new UpdateCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);
    const updatedKennel = result.Attributes as any;
    
    console.log('Updated kennel from DynamoDB:', updatedKennel);
    console.log('Updated facilities:', updatedKennel?.facilities);
    console.log('Facilities type:', typeof updatedKennel?.facilities);
    console.log('Is facilities object:', updatedKennel?.facilities && typeof updatedKennel?.facilities === 'object');

    return NextResponse.json({ kennel: updatedKennel });
  } catch (error) {
    console.error('Error updating kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/kennels/[id] - Delete kennel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;

    // Get existing kennel
    const getCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    const existingKennel = getResult.Item as any; // Using any to handle kennel properties

    // Check if user is the owner (only owners can delete)
    if (!existingKennel.owners.includes(session.user.id)) {
      return NextResponse.json({ error: 'Only kennel owners can delete kennels' }, { status: 403 });
    }

    // Check if kennel has dogs or litters
    const dogsCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: 'kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': kennelId,
      },
      Limit: 1,
    });

    const dogsResult = await docClient.send(dogsCommand);
    if (dogsResult.Items && dogsResult.Items.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete kennel with existing dogs. Please remove all dogs first.' 
      }, { status: 400 });
    }

    const littersCommand = new ScanCommand({
      TableName: LITTERS_TABLE,
      FilterExpression: 'kennelId = :kennelId',
      ExpressionAttributeValues: {
        ':kennelId': kennelId,
      },
      Limit: 1,
    });

    const littersResult = await docClient.send(littersCommand);
    if (littersResult.Items && littersResult.Items.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete kennel with existing litters. Please remove all litters first.' 
      }, { status: 400 });
    }

    // Delete kennel
    await docClient.send(new DeleteCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    }));

    return NextResponse.json({ message: 'Kennel deleted successfully' });
  } catch (error) {
    console.error('Error deleting kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
