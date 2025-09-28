// app/api/dogs/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const DOGS_TABLE_NAME = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'breeding-app-photos';

// Helper function to extract user ID from NextAuth session
async function getUserIdFromSession(): Promise<string | null> {
  try {
    const session = await getServerSession(authOptions);
    return (session?.user as any)?.id || null;
  } catch (error) {
    console.error('Error getting user ID from session:', error);
    return null;
  }
}

// GET /api/dogs/[id] - Get a specific dog
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const getParams = {
      TableName: DOGS_TABLE_NAME,
      Key: {
        ownerId: userId,
        id: id,
      },
    };

    const result = await docClient.send(new GetCommand(getParams));

    if (!result.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    return NextResponse.json(result.Item);
  } catch (error) {
    console.error('Error fetching dog:', error);
    return NextResponse.json({ error: 'Failed to fetch dog' }, { status: 500 });
  }
}

// PUT /api/dogs/[id] - Update a specific dog
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, check if the dog exists and belongs to the user
    const getParams = {
      TableName: DOGS_TABLE_NAME,
      Key: {
        ownerId: userId,
        id: id,
      },
    };

    const existingResult = await docClient.send(new GetCommand(getParams));
    if (!existingResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const formData = await request.formData();
    
    // Extract form data
    const updateExpression: string[] = [];
    const expressionAttributeNames: { [key: string]: string } = {};
    const expressionAttributeValues: { [key: string]: any } = {};

    // Helper function to add updates
    const addUpdate = (field: string, value: any, dbField?: string) => {
      if (value !== null && value !== undefined && value !== '') {
        const fieldName = dbField || field;
        updateExpression.push(`#${fieldName} = :${fieldName}`);
        expressionAttributeNames[`#${fieldName}`] = fieldName;
        expressionAttributeValues[`:${fieldName}`] = typeof value === 'string' ? value.trim() : value;
      }
    };

    // Process form fields
    const name = formData.get('name') as string;
    const breed = formData.get('breed') as string;
    const color = formData.get('color') as string;

    if (name) addUpdate('name', name);
    if (breed) addUpdate('breed', breed);
    if (color) addUpdate('color', color);
    
    addUpdate('gender', formData.get('gender'));
    addUpdate('birthDate', formData.get('birthDate'));
    addUpdate('breedingStatus', formData.get('breedingStatus'));
    addUpdate('healthStatus', formData.get('healthStatus'));
    addUpdate('registrationNumber', formData.get('registrationNumber'));
    addUpdate('microchipNumber', formData.get('microchipNumber'));
    addUpdate('notes', formData.get('notes'));

    // Handle weight
    const weightStr = formData.get('weight') as string;
    if (weightStr && weightStr.trim()) {
      const weight = parseFloat(weightStr);
      if (!isNaN(weight) && weight > 0 && weight <= 300) {
        addUpdate('weight', weight);
      }
    }

    // Handle photo upload
    const photo = formData.get('photo') as File;
    if (photo && photo.size > 0) {
      // Validate photo
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
      }

      if (photo.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: 'File too large. Please upload an image smaller than 5MB.' }, { status: 400 });
      }

      try {
        // Delete old photo if exists
        if (existingResult.Item.photoUrl) {
          try {
            const oldKey = existingResult.Item.photoUrl.split('.com/')[1];
            await s3Client.send(new DeleteObjectCommand({
              Bucket: S3_BUCKET_NAME,
              Key: oldKey,
            }));
          } catch (deleteError) {
            console.warn('Failed to delete old photo:', deleteError);
          }
        }

        // Upload new photo
        const fileExtension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `dogs/${userId}/${uuidv4()}.${fileExtension}`;
        
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(await photo.arrayBuffer()),
          ContentType: photo.type,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        
        // Use custom domain if available, otherwise fallback to S3 URL
        const customDomain = process.env.NEXT_PUBLIC_AWS_S3_CUSTOM_DOMAIN;
        const photoUrl = customDomain 
          ? `https://${customDomain}/${fileName}`
          : `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
        addUpdate('photoUrl', photoUrl);
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
      }
    }

    // Add updatedAt timestamp
    addUpdate('updatedAt', new Date().toISOString());

    if (updateExpression.length === 0) {
      return NextResponse.json({ error: 'No valid updates provided' }, { status: 400 });
    }

    const updateParams = {
      TableName: DOGS_TABLE_NAME,
      Key: {
        ownerId: userId,
        id: id,
      },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as const,
    };

    const result = await docClient.send(new UpdateCommand(updateParams));

    return NextResponse.json(result.Attributes);
  } catch (error) {
    console.error('Error updating dog:', error);
    return NextResponse.json({ error: 'Failed to update dog' }, { status: 500 });
  }
}

// DELETE /api/dogs/[id] - Delete a specific dog
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const userId = await getUserIdFromSession();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // First, get the dog to check ownership and get photo URL
    const getParams = {
      TableName: DOGS_TABLE_NAME,
      Key: {
        ownerId: userId,
        id: id,
      },
    };

    const existingResult = await docClient.send(new GetCommand(getParams));
    if (!existingResult.Item) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Delete photo from S3 if exists
    if (existingResult.Item.photoUrl) {
      try {
        const photoKey = existingResult.Item.photoUrl.split('.com/')[1];
        await s3Client.send(new DeleteObjectCommand({
          Bucket: S3_BUCKET_NAME,
          Key: photoKey,
        }));
      } catch (deleteError) {
        console.warn('Failed to delete photo from S3:', deleteError);
      }
    }

    // Delete the dog record
    const deleteParams = {
      TableName: DOGS_TABLE_NAME,
      Key: {
        ownerId: userId,
        id: id,
      },
    };

    await docClient.send(new DeleteCommand(deleteParams));

    return NextResponse.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    return NextResponse.json({ error: 'Failed to delete dog' }, { status: 500 });
  }
}