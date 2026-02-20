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

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
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
      throw new ApiError('Forbidden: You do not have permission to update this dog', 403);
    }

    const updates = JSON.parse(event.body);

    // Don't allow updating certain fields
    delete updates.id;
    delete updates.dogId;
    delete updates.ownerId;
    delete updates.createdAt;

    // Add updatedAt
    updates.updatedAt = new Date().toISOString();

    // Update the dog and return the updated record
    const [updatedDog] = await db.update(dogs).set(updates).where(eq(dogs.id, dogId)).returning();

    // Fetch kennel information if kennelId exists
    let kennel = null;
    if (updatedDog?.kennelId) {
      try {
        const [kennelResult] = await db.select().from(kennels).where(eq(kennels.id, updatedDog.kennelId)).limit(1);
        if (kennelResult) {
          kennel = kennelResult;
        }
      } catch (kennelError) {
        console.warn(`Failed to fetch kennel ${updatedDog.kennelId}:`, kennelError);
      }
    }

    return successResponse({
      dog: updatedDog,
      kennel,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating dog:', error);
    throw new ApiError('Failed to update dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
