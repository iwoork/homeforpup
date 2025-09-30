import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { UpdateLitterRequest } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const LITTERS_TABLE = process.env.LITTERS_TABLE_NAME || 'homeforpup-litters';

// GET /api/litters/[id] - Get litter details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;

    const getCommand = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id: litterId },
    });

    const result = await docClient.send(getCommand);
    if (!result.Item) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    const litter = result.Item as any; // Using any to handle kennelOwners property

    // Check if user has access to this litter's kennel
    if (!litter.kennelOwners?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ litter });
  } catch (error) {
    console.error('Error fetching litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/litters/[id] - Update litter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;
    const body: UpdateLitterRequest = await request.json();

    // Get existing litter
    const getCommand = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id: litterId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    const existingLitter = getResult.Item as any; // Using any to handle kennelOwners property

    // Check if user has permission to update
    if (!existingLitter.kennelOwners?.includes(session.user.id)) {
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
      'name', 'expectedPuppyCount', 'actualPuppyCount', 'status',
      'birthDate', 'health', 'notes', 'specialInstructions', 'puppies'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field as keyof UpdateLitterRequest] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field as keyof UpdateLitterRequest];
      }
    });

    const updateCommand = new UpdateCommand({
      TableName: LITTERS_TABLE,
      Key: { id: litterId },
      UpdateExpression: updateExpression,
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await docClient.send(updateCommand);
    const updatedLitter = result.Attributes as any;

    return NextResponse.json({ litter: updatedLitter });
  } catch (error) {
    console.error('Error updating litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/litters/[id] - Delete litter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;

    // Get existing litter
    const getCommand = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id: litterId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    const existingLitter = getResult.Item as any; // Using any to handle kennelOwners property

    // Check if user has permission to delete
    if (!existingLitter.kennelOwners?.includes(session.user.id)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if litter has puppies
    if (existingLitter.puppies && existingLitter.puppies.length > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete litter with existing puppies. Please remove all puppies first.' 
      }, { status: 400 });
    }

    // Delete litter
    await docClient.send(new DeleteCommand({
      TableName: LITTERS_TABLE,
      Key: { id: litterId },
    }));

    return NextResponse.json({ message: 'Litter deleted successfully' });
  } catch (error) {
    console.error('Error deleting litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
