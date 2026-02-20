import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

import { auth } from '@clerk/nextjs/server';
const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const docClient = DynamoDBDocumentClient.from(client);
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const LITTERS_TABLE = process.env.LITTERS_TABLE_NAME || 'homeforpup-litters';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kennelId } = await params;

    // Get kennel by id (string UUID)
    const kennelResult = await docClient.send(
      new GetCommand({
        TableName: KENNELS_TABLE,
        Key: { id: kennelId },
      })
    );

    if (!kennelResult.Item) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    const kennel = kennelResult.Item as any;

    // Only show active kennels
    if (kennel.status !== 'active') {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Get dogs for this kennel
    const dogsResult = await docClient.send(
      new ScanCommand({
        TableName: DOGS_TABLE,
        FilterExpression: 'kennelId = :kennelId',
        ExpressionAttributeValues: {
          ':kennelId': kennelId,
        },
      })
    );

    const allDogs = (dogsResult.Items || []) as any[];

    // Filter to parent dogs only (puppies are embedded in litters)
    const parentDogs = allDogs.filter(
      (dog) => dog.type === 'parent' || dog.dogType === 'parent'
    );

    // Get litters for this kennel
    const littersResult = await docClient.send(
      new ScanCommand({
        TableName: LITTERS_TABLE,
        FilterExpression: 'kennelId = :kennelId',
        ExpressionAttributeValues: {
          ':kennelId': kennelId,
        },
      })
    );

    const litters = (littersResult.Items || []) as any[];

    // Calculate stats
    const stats = {
      totalDogs: parentDogs.length,
      totalLitters: litters.length,
      totalPuppies: litters.reduce(
        (sum, litter) => sum + (litter.actualPuppyCount || litter.puppies?.length || 0),
        0
      ),
      activeBreedingDogs: parentDogs.filter(
        (dog) =>
          dog.breeding?.isBreedingDog && dog.breeding?.breedingStatus === 'available'
      ).length,
    };

    // Strip sensitive fields from kennel
    const { owners, managers, createdBy, ...safeKennel } = kennel;

    // Strip sensitive fields from dogs
    const safeDogs = parentDogs.map(({ ownerId, createdBy: _cb, ...rest }) => rest);

    return NextResponse.json({
      kennel: safeKennel,
      dogs: safeDogs,
      litters,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching kennel:', error);

    if (
      error.name === 'ResourceNotFoundException' ||
      error.message?.includes('ResourceNotFoundException') ||
      error.__type === 'com.amazonaws.dynamodb.v20120810#ResourceNotFoundException'
    ) {
      return NextResponse.json(
        { error: 'Table not found' },
        { status: 503 }
      );
    }

    return NextResponse.json(
      {
        message: 'Error fetching kennel',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
