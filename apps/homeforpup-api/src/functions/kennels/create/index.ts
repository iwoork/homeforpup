import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, PutCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  let userId: string;
  try {
    userId = getUserIdFromEvent(event as any);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Unauthorized', 401);
  }

  // Check if user is a breeder
  const userType = (event as any).requestContext.authorizer?.userType;
  if (userType !== 'breeder') {
    return errorResponse('Forbidden: Only breeders can create kennels', 403);
  }

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  try {
    const body = JSON.parse(event.body);

    // Validate required fields
    if (!body.name || !body.address) {
      return errorResponse('Missing required fields: name, address', 400);
    }

    const kennelId = uuidv4();
    const timestamp = new Date().toISOString();

    const kennel: any = {
      id: kennelId,
      name: body.name,
      description: body.description,
      businessName: body.businessName,
      website: body.website,
      phone: body.phone,
      email: body.email,
      address: body.address,
      facilities: body.facilities || {
        indoorSpace: false,
        outdoorSpace: false,
        exerciseArea: false,
        whelpingArea: false,
        quarantineArea: false,
        groomingArea: false,
        veterinaryAccess: false,
        climateControl: false,
        security: false,
        other: [],
      },
      capacity: body.capacity || {
        maxDogs: 10,
        maxLitters: 5,
        currentDogs: 0,
        currentLitters: 0,
      },
      owners: [userId],
      managers: [userId],
      createdBy: userId,
      status: 'active',
      verified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      photos: [],
      videos: [],
      specialties: body.specialties || [],
      socialMedia: body.socialMedia,
    };

    await dynamodb.send(
      new PutCommand({
        TableName: KENNELS_TABLE,
        Item: kennel,
      })
    );

    return successResponse({ kennel }, 201);
  } catch (error) {
    console.error('Error creating kennel:', error);
    return errorResponse('Failed to create kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

