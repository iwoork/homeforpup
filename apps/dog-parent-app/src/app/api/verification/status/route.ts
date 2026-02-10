import { NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../../lib/auth';

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

// GET /api/verification/status - Get current user's verification status
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureTableExists();

    const breederId = (session.user as Record<string, unknown>).id as string;

    // Query all verification requests for this breeder, sorted by most recent
    const result = await dynamodb.send(
      new QueryCommand({
        TableName: VERIFICATION_TABLE,
        KeyConditionExpression: 'breederId = :breederId',
        ExpressionAttributeValues: {
          ':breederId': breederId,
        },
        ScanIndexForward: false,
      })
    );

    const requests = result.Items || [];

    if (requests.length === 0) {
      return NextResponse.json({
        status: 'none',
        verificationRequest: null,
        message: 'No verification request found',
      });
    }

    // Return the most recent verification request
    const latestRequest = requests.sort(
      (a, b) => new Date(b.submittedAt as string).getTime() - new Date(a.submittedAt as string).getTime()
    )[0];

    return NextResponse.json({
      status: latestRequest.status,
      verificationRequest: latestRequest,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
