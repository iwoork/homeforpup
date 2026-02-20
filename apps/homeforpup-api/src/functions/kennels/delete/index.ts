import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, DeleteCommand } from '../../../shared/dynamodb';
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

  // Check if user is a breeder
  const userType = (event as any).requestContext.authorizer?.userType;
  if (userType !== 'breeder') {
    return errorResponse('Forbidden: Only breeders can delete kennels', 403);
  }

  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  try {
    // Get existing kennel to check ownership
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
    console.log('Checking kennel ownership for deletion:', {
      userId,
      kennelId,
      owners: existingKennel.owners,
      ownerId: existingKennel.ownerId,
      createdBy: existingKennel.createdBy,
    });

    // Check if user is owner (only owners can delete) - check multiple ownership fields for backward compatibility
    // Handle both array and string cases for owners
    const ownersArray = Array.isArray(existingKennel.owners) 
      ? existingKennel.owners 
      : (existingKennel.owners ? [existingKennel.owners] : []);

    const isOwner = 
      ownersArray.includes(userId) || 
      existingKennel.ownerId === userId || 
      existingKennel.createdBy === userId;

    console.log('Authorization check for deletion:', { isOwner });

    if (!isOwner) {
      return errorResponse('Forbidden: Only kennel owners can delete kennels', 403);
    }

    // Delete kennel
    await dynamodb.send(
      new DeleteCommand({
        TableName: KENNELS_TABLE,
        Key: { id: kennelId },
      })
    );

    return successResponse({ message: 'Kennel deleted successfully' });
  } catch (error) {
    console.error('Error deleting kennel:', error);
    return errorResponse('Failed to delete kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

