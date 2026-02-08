import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb';

const createDynamoClient = () => {
  const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

// GET /api/puppies/[id] - Get puppy details with kennel data (public)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const dog = await dogsApiClient.getDogById(id);

    if (!dog) {
      return NextResponse.json({ error: 'Puppy not found' }, { status: 404 });
    }

    // Fetch kennel data if the dog has a kennelId
    let kennel = null;
    if (dog.kennelId) {
      try {
        const dynamodb = createDynamoClient();
        const kennelResult = await dynamodb.send(
          new GetCommand({
            TableName: KENNELS_TABLE,
            Key: { id: dog.kennelId },
          })
        );
        kennel = kennelResult.Item || null;
      } catch (error) {
        console.error('Error fetching kennel:', error);
      }
    }

    // Calculate age in weeks
    const birthDate = new Date(dog.birthDate);
    const now = new Date();
    const ageWeeks = Math.floor(
      (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    // Extract photo URL
    const profilePhoto = dog.photoGallery?.find(
      (photo) => photo.isProfilePhoto
    )?.url;
    const firstPhoto = dog.photoGallery?.[0]?.url;
    const photoUrl = dog.photoUrl || profilePhoto || firstPhoto;

    return NextResponse.json({
      ...dog,
      kennel,
      ageWeeks,
      photoUrl: photoUrl || null,
      location: kennel?.address
        ? `${kennel.address.city}, ${kennel.address.state}`
        : null,
    });
  } catch (error) {
    console.error('Error fetching puppy:', error);
    return NextResponse.json(
      {
        message: 'Error fetching puppy',
        error:
          process.env.NODE_ENV === 'development'
            ? String(error)
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
