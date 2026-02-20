import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});

const WAITLIST_TABLE = process.env.WAITLIST_TABLE_NAME || 'homeforpup-waitlist';

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: WAITLIST_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: WAITLIST_TABLE,
          KeySchema: [
            { AttributeName: 'litterId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'litterId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${WAITLIST_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// PUT /api/litters/[litterId]/waitlist/[entryId] - Update a waitlist entry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ litterId: string; entryId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId, entryId } = await context.params;
    const body = await request.json();

    await ensureTableExists();

    // Build update expression dynamically
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {
      ':updatedAt': new Date().toISOString(),
    };

    const fields = [
      'buyerName', 'buyerEmail', 'buyerPhone', 'position',
      'status', 'depositAmount', 'depositPaid', 'genderPreference',
      'colorPreference', 'notes',
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updateExpression += `, #${field} = :${field}`;
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = body[field];
      }
    });

    const result = await dynamodb.send(
      new UpdateCommand({
        TableName: WAITLIST_TABLE,
        Key: { litterId, id: entryId },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return NextResponse.json({ entry: result.Attributes });
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/litters/[litterId]/waitlist/[entryId] - Remove a waitlist entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ litterId: string; entryId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId, entryId } = await context.params;

    await ensureTableExists();

    // Verify the entry exists
    const existing = await dynamodb.send(
      new GetCommand({
        TableName: WAITLIST_TABLE,
        Key: { litterId, id: entryId },
      })
    );

    if (!existing.Item) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    await dynamodb.send(
      new DeleteCommand({
        TableName: WAITLIST_TABLE,
        Key: { litterId, id: entryId },
      })
    );

    return NextResponse.json({ message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
