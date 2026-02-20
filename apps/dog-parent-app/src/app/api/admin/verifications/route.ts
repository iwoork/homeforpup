import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  QueryCommand,
  ScanCommand,
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

const VERIFICATION_TABLE = process.env.VERIFICATION_TABLE_NAME || 'homeforpup-verification-requests';

// Simple admin check: list of admin user IDs from environment variable
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

let tableVerified = false;

async function ensureTableExists(): Promise<void> {
  if (tableVerified) return;

  try {
    await client.send(new DescribeTableCommand({ TableName: VERIFICATION_TABLE }));
    tableVerified = true;
  } catch (error: unknown) {
    if (error instanceof Error && error.name === 'ResourceNotFoundException') {
      await client.send(
        new CreateTableCommand({
          TableName: VERIFICATION_TABLE,
          KeySchema: [
            { AttributeName: 'breederId', KeyType: 'HASH' },
            { AttributeName: 'id', KeyType: 'RANGE' },
          ],
          AttributeDefinitions: [
            { AttributeName: 'breederId', AttributeType: 'S' },
            { AttributeName: 'id', AttributeType: 'S' },
            { AttributeName: 'status', AttributeType: 'S' },
            { AttributeName: 'submittedAt', AttributeType: 'S' },
          ],
          GlobalSecondaryIndexes: [
            {
              IndexName: 'status-submittedAt-index',
              KeySchema: [
                { AttributeName: 'status', KeyType: 'HASH' },
                { AttributeName: 'submittedAt', KeyType: 'RANGE' },
              ],
              Projection: { ProjectionType: 'ALL' },
              ProvisionedThroughput: {
                ReadCapacityUnits: 5,
                WriteCapacityUnits: 5,
              },
            },
          ],
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5,
          },
        })
      );
      console.log(`Table ${VERIFICATION_TABLE} created successfully`);
      tableVerified = true;
    } else {
      throw error;
    }
  }
}

// GET /api/admin/verifications - List all verification requests with pagination and status filter
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await ensureTableExists();

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const lastKey = searchParams.get('lastKey');

    let items: Record<string, unknown>[] = [];
    let lastEvaluatedKey: Record<string, unknown> | undefined;

    if (status) {
      // Use GSI to query by status
      const result = await dynamodb.send(
        new QueryCommand({
          TableName: VERIFICATION_TABLE,
          IndexName: 'status-submittedAt-index',
          KeyConditionExpression: '#status = :status',
          ExpressionAttributeNames: { '#status': 'status' },
          ExpressionAttributeValues: { ':status': status },
          Limit: limit,
          ScanIndexForward: false,
          ...(lastKey ? { ExclusiveStartKey: JSON.parse(Buffer.from(lastKey, 'base64').toString()) } : {}),
        })
      );
      items = (result.Items || []) as Record<string, unknown>[];
      lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    } else {
      // Scan all records (no status filter)
      const result = await dynamodb.send(
        new ScanCommand({
          TableName: VERIFICATION_TABLE,
          Limit: limit,
          ...(lastKey ? { ExclusiveStartKey: JSON.parse(Buffer.from(lastKey, 'base64').toString()) } : {}),
        })
      );
      items = (result.Items || []) as Record<string, unknown>[];
      lastEvaluatedKey = result.LastEvaluatedKey as Record<string, unknown> | undefined;
    }

    // Sort by submittedAt descending
    items.sort((a, b) => {
      const dateA = new Date(a.submittedAt as string).getTime();
      const dateB = new Date(b.submittedAt as string).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({
      verificationRequests: items,
      nextKey: lastEvaluatedKey
        ? Buffer.from(JSON.stringify(lastEvaluatedKey)).toString('base64')
        : null,
      count: items.length,
    });
  } catch (error) {
    console.error('Error listing verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to list verification requests' },
      { status: 500 }
    );
  }
}
