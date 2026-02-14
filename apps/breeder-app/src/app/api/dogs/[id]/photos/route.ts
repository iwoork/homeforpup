import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { DogPhoto } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient, {
  marshallOptions: {
    removeUndefinedValues: true,
  },
});
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';

// POST /api/dogs/[id]/photos - Add photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const body = await request.json();

    // Get existing dog
    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const getResult = await docClient.send(getCommand);
    if (!getResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const existingDog = getResult.Item as any;

    // Check if user has permission
    const access = await checkDogAccess(session.user.id, existingDog);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new photo record
    const photoId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create photo object with only defined values
    const newPhoto: any = {
      id: photoId,
      dogId: dogId,
      url: body.url,
      category: body.category || 'general',
      takenDate: body.takenDate || timestamp,
      tags: body.tags || [],
      isProfilePhoto: Boolean(body.isProfilePhoto),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Add optional fields only if they exist
    if (body.thumbnailUrl) newPhoto.thumbnailUrl = body.thumbnailUrl;
    if (body.caption) newPhoto.caption = body.caption;
    if (body.photographer) newPhoto.photographer = body.photographer;

    // Update dog with new photo
    const existingPhotos = existingDog.photoGallery || [];
    const updatedPhotos = [...existingPhotos, newPhoto];

    // If this is set as profile photo, unset any existing profile photos
    if (body.isProfilePhoto) {
      updatedPhotos.forEach(photo => {
        if (photo.id !== photoId) {
          photo.isProfilePhoto = false;
        }
      });
    }

    const updateCommand = new UpdateCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
      UpdateExpression: 'SET photoGallery = :photos, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':photos': updatedPhotos,
        ':updatedAt': timestamp,
      },
    });

    await docClient.send(updateCommand);

    return NextResponse.json({ photo: newPhoto }, { status: 201 });
  } catch (error) {
    console.error('Error adding photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/photos - Get photos for dog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;

    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const result = await docClient.send(getCommand);
    if (!result.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const dog = result.Item as any;

    // Check if user has access
    const access = await checkDogAccess(session.user.id, dog);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const photos = dog.photoGallery || [];

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
