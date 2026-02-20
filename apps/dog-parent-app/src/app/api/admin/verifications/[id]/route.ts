import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import { auth } from '@clerk/nextjs/server';
import {
  DynamoDBDocumentClient,
  ScanCommand,
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

const VERIFICATION_TABLE = process.env.VERIFICATION_TABLE_NAME || 'homeforpup-verification-requests';
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

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

// Find a verification request by its id (range key) - requires scanning since we don't know breederId
async function findVerificationRequestById(id: string): Promise<Record<string, unknown> | null> {
  const result = await dynamodb.send(
    new ScanCommand({
      TableName: VERIFICATION_TABLE,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id },
      Limit: 1,
    })
  );
  return (result.Items && result.Items.length > 0 ? result.Items[0] : null) as Record<string, unknown> | null;
}

// GET /api/admin/verifications/[id] - Get a single verification request with all documents
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await ensureTableExists();

    const { id } = await context.params;
    const verificationRequest = await findVerificationRequestById(id);

    if (!verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    return NextResponse.json({ verificationRequest });
  } catch (error) {
    console.error('Error fetching verification request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/verifications/[id] - Approve or reject a verification request
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    await ensureTableExists();

    const { id } = await context.params;
    const body = await request.json();
    const { status, reviewerNotes } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && (!reviewerNotes || typeof reviewerNotes !== 'string' || reviewerNotes.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Reviewer notes are required when rejecting a request' },
        { status: 400 }
      );
    }

    // Find the verification request to get breederId (needed as partition key)
    const existingRequest = await findVerificationRequestById(id);
    if (!existingRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    const now = new Date().toISOString();
    const breederId = existingRequest.breederId as string;

    // Update the verification request
    const updateResult = await dynamodb.send(
      new UpdateCommand({
        TableName: VERIFICATION_TABLE,
        Key: { breederId, id },
        UpdateExpression: 'SET #status = :status, reviewedAt = :reviewedAt, reviewerNotes = :reviewerNotes, updatedAt = :updatedAt',
        ExpressionAttributeNames: { '#status': 'status' },
        ExpressionAttributeValues: {
          ':status': status,
          ':reviewedAt': now,
          ':reviewerNotes': reviewerNotes || '',
          ':updatedAt': now,
        },
        ReturnValues: 'ALL_NEW',
      })
    );

    // If approved, update the breeder's kennel to set verified=true
    if (status === 'approved') {
      const kennelId = existingRequest.kennelId as string;
      if (kennelId) {
        try {
          await dynamodb.send(
            new UpdateCommand({
              TableName: KENNELS_TABLE,
              Key: { id: kennelId },
              UpdateExpression: 'SET verified = :verified, verificationDate = :verificationDate, updatedAt = :updatedAt',
              ExpressionAttributeValues: {
                ':verified': true,
                ':verificationDate': now,
                ':updatedAt': now,
              },
              ReturnValues: 'ALL_NEW',
            })
          );
          console.log(`Kennel ${kennelId} marked as verified`);
        } catch (kennelError) {
          console.error(`Failed to update kennel ${kennelId} verified status:`, kennelError);
          // Don't fail the whole request - the verification was updated successfully
        }
      }
    }

    return NextResponse.json({
      message: `Verification request ${status}`,
      verificationRequest: updateResult.Attributes,
    });
  } catch (error) {
    console.error('Error updating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to update verification request' },
      { status: 500 }
    );
  }
}
