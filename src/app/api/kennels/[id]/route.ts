import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { verifyJWTEnhanced } from '@/lib';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const KENNELS_TABLE = 'homeforpup-kennels';

// GET /api/kennels/[id] - Get a specific kennel
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const kennelId = params.id;

    const getParams = {
      TableName: KENNELS_TABLE,
      Key: {
        ownerId: 'temp', // We'll need to find the ownerId
        id: kennelId,
      },
    };

    // For now, we'll need to scan to find the kennel
    // In production, you might want to add a GSI on id
    const result = await docClient.send(new GetCommand(getParams));
    
    if (!result.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    return NextResponse.json(result.Item);
  } catch (error) {
    console.error('Error fetching kennel:', error);
    return NextResponse.json({ error: 'Failed to fetch kennel' }, { status: 500 });
  }
}

// PUT /api/kennels/[id] - Update a kennel
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const kennelId = params.id;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const { userId } = await verifyJWTEnhanced(token);
    const body = await request.json();

    // First, get the existing kennel to verify ownership
    const getParams = {
      TableName: KENNELS_TABLE,
      Key: {
        ownerId: userId,
        id: kennelId,
      },
    };

    const existingKennel = await docClient.send(new GetCommand(getParams));
    if (!existingKennel.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    const allowedFields = [
      'name', 'description', 'location', 'website', 'phone', 'email',
      'specialties', 'establishedDate', 'licenseNumber', 'photoUrl', 'coverPhoto', 'isActive'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field];
      }
    });

    if (updateExpressions.length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const updateParams = {
      TableName: KENNELS_TABLE,
      Key: {
        ownerId: userId,
        id: kennelId,
      },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as const,
    };

    const result = await docClient.send(new UpdateCommand(updateParams));
    return NextResponse.json(result.Attributes);
  } catch (error) {
    console.error('Error updating kennel:', error);
    return NextResponse.json({ error: 'Failed to update kennel' }, { status: 500 });
  }
}

// DELETE /api/kennels/[id] - Delete a kennel
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const kennelId = params.id;

    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    if (!token) {
      return NextResponse.json({ error: 'No token provided' }, { status: 401 });
    }

    const { userId } = await verifyJWTEnhanced(token);

    // First, check if the kennel exists and belongs to the user
    const getParams = {
      TableName: KENNELS_TABLE,
      Key: {
        ownerId: userId,
        id: kennelId,
      },
    };

    const existingKennel = await docClient.send(new GetCommand(getParams));
    if (!existingKennel.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Delete the kennel
    const deleteParams = {
      TableName: KENNELS_TABLE,
      Key: {
        ownerId: userId,
        id: kennelId,
      },
    };

    await docClient.send(new DeleteCommand(deleteParams));
    return NextResponse.json({ message: 'Kennel deleted successfully' });
  } catch (error) {
    console.error('Error deleting kennel:', error);
    return NextResponse.json({ error: 'Failed to delete kennel' }, { status: 500 });
  }
}
