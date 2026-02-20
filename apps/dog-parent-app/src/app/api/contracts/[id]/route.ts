import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  UpdateCommand,
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

const CONTRACTS_TABLE = process.env.CONTRACTS_TABLE_NAME || 'homeforpup-contracts';

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: CONTRACTS_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: CONTRACTS_TABLE,
          KeySchema: [
            { AttributeName: 'breederId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'breederId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${CONTRACTS_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/contracts/[id] - Get a single contract by scanning across all breeders
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await ensureTableExists();

    // Since we need to find by id without knowing breederId, we use a query
    // with a filter. For a single-item lookup, the caller should provide breederId
    // as a query param for efficiency.
    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');

    if (breederId) {
      // Efficient: direct key lookup via query
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: CONTRACTS_TABLE,
          KeyConditionExpression: 'breederId = :breederId AND id = :id',
          ExpressionAttributeValues: {
            ':breederId': breederId,
            ':id': id,
          },
        })
      );

      if (!result.Items || result.Items.length === 0) {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ contract: result.Items[0] });
    }

    // Fallback: check session user as breederId
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await dynamodb.send(
      new QueryCommand({
        TableName: CONTRACTS_TABLE,
        KeyConditionExpression: 'breederId = :breederId AND id = :id',
        ExpressionAttributeValues: {
          ':breederId': userId,
          ':id': id,
        },
      })
    );

    if (!result.Items || result.Items.length === 0) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract: result.Items[0] });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] - Update a contract
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    await ensureTableExists();

    // Build update expression dynamically
    let updateExpression = 'SET updatedAt = :updatedAt';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, unknown> = {
      ':updatedAt': new Date().toISOString(),
    };

    const fields = [
      'buyerName', 'buyerEmail', 'litterId', 'puppyId',
      'status', 'contractType', 'totalAmount', 'depositAmount',
      'depositPaid', 'terms',
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
        TableName: CONTRACTS_TABLE,
        Key: { breederId: userId, id },
        UpdateExpression: updateExpression,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: 'ALL_NEW',
      })
    );

    return NextResponse.json({ contract: result.Attributes });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}
