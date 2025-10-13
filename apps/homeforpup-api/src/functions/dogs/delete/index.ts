import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, DeleteCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const DOGS_TABLE = process.env.DOGS_TABLE!;
const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  try {
    // First, check if the dog exists
    const getDogCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const existing = await dynamodb.send(getDogCommand);

    if (!existing.Item) {
      throw new ApiError('Dog not found', 404);
    }

    // Check permission through kennel ownership/management
    let hasPermission = false;
    
    // Check direct ownership
    if (existing.Item.ownerId === userId) {
      hasPermission = true;
    }
    
    // Check kennel ownership/management if not direct owner
    if (!hasPermission && existing.Item.kennelId) {
      const getKennelCommand = new GetCommand({
        TableName: KENNELS_TABLE,
        Key: { id: existing.Item.kennelId },
      });
      
      const kennelResult = await dynamodb.send(getKennelCommand);
      
      if (kennelResult.Item) {
        const kennel = kennelResult.Item;
        // Check if user is owner or manager of the kennel
        hasPermission = 
          (kennel.owners && kennel.owners.includes(userId)) ||
          (kennel.managers && kennel.managers.includes(userId)) ||
          kennel.ownerId === userId || // backward compatibility
          kennel.createdBy === userId; // backward compatibility
      }
    }
    
    if (!hasPermission) {
      throw new ApiError('Forbidden: You do not have permission to delete this dog', 403);
    }

    // Delete the dog
    const deleteCommand = new DeleteCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    await dynamodb.send(deleteCommand);

    return successResponse({
      message: 'Dog deleted successfully',
      dogId,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error deleting dog:', error);
    throw new ApiError('Failed to delete dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

