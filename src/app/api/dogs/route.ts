// app/api/dogs/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { v4 as uuidv4 } from 'uuid';
import jwt from 'jsonwebtoken';

// Initialize DynamoDB client
const dynamoClient = new DynamoDBClient({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);

// Initialize S3 client for photo uploads
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const DOGS_TABLE_NAME = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME || 'breeding-app-photos';

interface DogData {
  id: string;
  ownerId: string;
  name: string;
  breed: string;
  gender: 'male' | 'female';
  birthDate: string;
  weight?: number;
  color: string;
  breedingStatus: 'available' | 'retired' | 'not_ready';
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  registrationNumber?: string;
  microchipNumber?: string;
  notes?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

// Helper function to extract user ID from Cognito JWT token
function getUserIdFromToken(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null;
    }

    const token = authHeader.substring(7);
    const decoded = jwt.decode(token) as any;
    
    // Cognito tokens contain the user ID in the 'sub' field
    return decoded?.sub || null;
  } catch (error) {
    console.error('Error extracting user ID from token:', error);
    return null;
  }
}

// GET /api/dogs - Get all dogs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = {
      TableName: DOGS_TABLE_NAME,
      KeyConditionExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: {
        ':ownerId': userId,
      },
      ScanIndexForward: false, // Sort by sort key in descending order (newest first)
    };

    const result = await docClient.send(new QueryCommand(params));
    
    return NextResponse.json(result.Items || []);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json({ error: 'Failed to fetch dogs' }, { status: 500 });
  }
}

// POST /api/dogs - Create a new dog
export async function POST(request: NextRequest) {
  try {
    const userId = getUserIdFromToken(request);
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    
    // Extract and validate form data
    const name = formData.get('name') as string;
    const breed = formData.get('breed') as string;
    const gender = formData.get('gender') as 'male' | 'female';
    const birthDate = formData.get('birthDate') as string;
    const color = formData.get('color') as string;
    const breedingStatus = formData.get('breedingStatus') as 'available' | 'retired' | 'not_ready';
    const healthStatus = formData.get('healthStatus') as 'excellent' | 'good' | 'fair' | 'poor';

    // Validate required fields
    if (!name || !breed || !gender || !birthDate || !color || !breedingStatus || !healthStatus) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Extract optional fields
    const dogData: Partial<DogData> = {
      name: name.trim(),
      breed: breed.trim(),
      gender,
      birthDate,
      color: color.trim(),
      breedingStatus,
      healthStatus,
      registrationNumber: (formData.get('registrationNumber') as string)?.trim() || undefined,
      microchipNumber: (formData.get('microchipNumber') as string)?.trim() || undefined,
      notes: (formData.get('notes') as string)?.trim() || undefined,
    };

    // Parse weight if provided
    const weightStr = formData.get('weight') as string;
    if (weightStr && weightStr.trim()) {
      const weight = parseFloat(weightStr);
      if (!isNaN(weight) && weight > 0 && weight <= 300) {
        dogData.weight = weight;
      }
    }

    // Handle photo upload
    const photo = formData.get('photo') as File;
    let photoUrl = '';

    if (photo && photo.size > 0) {
      // Validate photo
      if (!photo.type.startsWith('image/')) {
        return NextResponse.json({ error: 'Invalid file type. Please upload an image.' }, { status: 400 });
      }

      if (photo.size > 5 * 1024 * 1024) { // 5MB limit
        return NextResponse.json({ error: 'File too large. Please upload an image smaller than 5MB.' }, { status: 400 });
      }

      try {
        const fileExtension = photo.name.split('.').pop()?.toLowerCase() || 'jpg';
        const fileName = `dogs/${userId}/${uuidv4()}.${fileExtension}`;
        
        const uploadParams = {
          Bucket: S3_BUCKET_NAME,
          Key: fileName,
          Body: Buffer.from(await photo.arrayBuffer()),
          ContentType: photo.type,
        };

        await s3Client.send(new PutObjectCommand(uploadParams));
        photoUrl = `https://${S3_BUCKET_NAME}.s3.amazonaws.com/${fileName}`;
      } catch (uploadError) {
        console.error('Error uploading photo:', uploadError);
        return NextResponse.json({ error: 'Failed to upload photo' }, { status: 500 });
      }
    }

    // Create dog record
    const dogId = uuidv4();
    const now = new Date().toISOString();

    const newDog: DogData = {
      id: dogId,
      ownerId: userId,
      ...dogData,
      photoUrl: photoUrl || undefined,
      createdAt: now,
      updatedAt: now,
    } as DogData;

    const params = {
      TableName: DOGS_TABLE_NAME,
      Item: newDog,
    };

    await docClient.send(new PutCommand(params));

    return NextResponse.json(newDog, { status: 201 });
  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json({ error: 'Failed to create dog' }, { status: 500 });
  }
}