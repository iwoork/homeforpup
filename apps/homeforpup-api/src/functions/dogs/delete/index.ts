import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, dogs, kennels, eq } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  try {
    const db = getDb();

    // First, check if the dog exists
    const [existing] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!existing) {
      throw new ApiError('Dog not found', 404);
    }

    // Check permission through kennel ownership/management
    let hasPermission = false;

    // Check direct ownership
    if (existing.ownerId === userId) {
      hasPermission = true;
    }

    // Check kennel ownership/management if not direct owner
    if (!hasPermission && existing.kennelId) {
      const [kennel] = await db.select().from(kennels).where(eq(kennels.id, existing.kennelId)).limit(1);

      if (kennel) {
        // Check if user is owner or manager of the kennel
        hasPermission =
          (kennel.owners && (kennel.owners as string[]).includes(userId)) ||
          (kennel.managers && (kennel.managers as string[]).includes(userId)) ||
          kennel.ownerId === userId || // backward compatibility
          kennel.createdBy === userId; // backward compatibility
      }
    }

    if (!hasPermission) {
      throw new ApiError('Forbidden: You do not have permission to delete this dog', 403);
    }

    // Delete the dog
    await db.delete(dogs).where(eq(dogs.id, dogId));

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
