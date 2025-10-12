import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, PutCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

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

  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  try {
    // Get existing kennel
    const getCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      return errorResponse('Kennel not found', 404);
    }

    const existingKennel = result.Item;

    // Log kennel ownership for debugging
    console.log('Checking kennel ownership:', {
      userId,
      kennelId,
      owners: existingKennel.owners,
      ownerId: existingKennel.ownerId,
      createdBy: existingKennel.createdBy,
      managers: existingKennel.managers,
    });

    // Check if user is owner or manager - check multiple ownership fields for backward compatibility
    // Handle both array and string cases for owners/managers
    const ownersArray = Array.isArray(existingKennel.owners) 
      ? existingKennel.owners 
      : (existingKennel.owners ? [existingKennel.owners] : []);
    const managersArray = Array.isArray(existingKennel.managers) 
      ? existingKennel.managers 
      : (existingKennel.managers ? [existingKennel.managers] : []);

    const isOwner = 
      ownersArray.includes(userId) || 
      existingKennel.ownerId === userId || 
      existingKennel.createdBy === userId;
    const isManager = managersArray.includes(userId);

    console.log('Authorization check:', { isOwner, isManager });

    if (!isOwner && !isManager) {
      return errorResponse('Forbidden: You do not have permission to update this kennel', 403);
    }

    const body = JSON.parse(event.body);

    // Update kennel (merge with existing data)
    const updatedKennel = {
      ...existingKennel,
      ...body,
      id: kennelId, // Ensure ID doesn't change
      owners: existingKennel.owners, // Preserve owners
      createdBy: existingKennel.createdBy, // Preserve creator
      createdAt: existingKennel.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    await dynamodb.send(
      new PutCommand({
        TableName: KENNELS_TABLE,
        Item: updatedKennel,
      })
    );

    return successResponse({ kennel: updatedKennel });
  } catch (error) {
    console.error('Error updating kennel:', error);
    return errorResponse('Failed to update kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

