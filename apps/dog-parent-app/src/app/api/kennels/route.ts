import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client);
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Scan for active kennels only — status is a reserved word so we alias it
    const command = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: '#status = :active',
      ExpressionAttributeNames: {
        '#status': 'status',
      },
      ExpressionAttributeValues: {
        ':active': 'active',
      },
    });

    const result = await dynamodb.send(command);
    let kennels = (result.Items || []) as any[];

    // Client-side search filter
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      kennels = kennels.filter((kennel) =>
        (kennel.name || '').toLowerCase().includes(searchLower) ||
        (kennel.businessName || '').toLowerCase().includes(searchLower) ||
        (kennel.specialties || []).some((s: string) => s.toLowerCase().includes(searchLower))
      );
    }

    // Strip sensitive fields before returning
    kennels = kennels.map(({ owners, managers, createdBy, ...rest }) => rest);

    // Client-side pagination
    const total = kennels.length;
    const startIndex = (page - 1) * limit;
    const paginatedKennels = kennels.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      kennels: paginatedKennels,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
    });
  } catch (error: any) {
    console.error('Error fetching kennels:', error);

    if (
      error.name === 'ResourceNotFoundException' ||
      error.message?.includes('ResourceNotFoundException') ||
      error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException'
    ) {
      return NextResponse.json(
        {
          error: 'Kennels table not found',
          message: `The DynamoDB table "${KENNELS_TABLE}" does not exist.`,
          tableName: KENNELS_TABLE,
        },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error fetching kennels',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
