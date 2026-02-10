import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';
import {
  DynamoDBDocumentClient,
  PutCommand,
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

interface VerificationDocument {
  type: 'license' | 'certification' | 'health_clearance' | 'insurance' | 'reference';
  name: string;
  url: string;
  uploadedAt: string;
}

interface VerificationRequest {
  id: string;
  breederId: string;
  kennelId: string;
  status: 'pending' | 'in_review' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  reviewerNotes?: string;
  documents: VerificationDocument[];
  createdAt: string;
  updatedAt: string;
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

const VALID_DOC_TYPES = ['license', 'certification', 'health_clearance', 'insurance', 'reference'] as const;

// POST /api/verification/submit - Create a new verification request
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kennelId, documents } = body;

    // Validate at least one document
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      );
    }

    // Validate each document
    for (const doc of documents) {
      if (!doc.type || !VALID_DOC_TYPES.includes(doc.type)) {
        return NextResponse.json(
          { error: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      if (!doc.name || typeof doc.name !== 'string' || doc.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each document must have a name' },
          { status: 400 }
        );
      }
      if (!doc.url || typeof doc.url !== 'string' || doc.url.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each document must have a url' },
          { status: 400 }
        );
      }
    }

    await ensureTableExists();

    const now = new Date().toISOString();
    const breederId = (session.user as Record<string, unknown>).id as string;

    const verificationRequest: VerificationRequest = {
      id: `vr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      breederId,
      kennelId: kennelId ? String(kennelId) : '',
      status: 'pending',
      submittedAt: now,
      documents: documents.map((doc: { type: string; name: string; url: string }) => ({
        type: doc.type as VerificationDocument['type'],
        name: doc.name.trim(),
        url: doc.url.trim(),
        uploadedAt: now,
      })),
      createdAt: now,
      updatedAt: now,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: VERIFICATION_TABLE,
        Item: verificationRequest,
      })
    );

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      verificationRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
}
