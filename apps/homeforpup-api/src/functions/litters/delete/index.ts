import { APIGatewayProxyResult } from 'aws-lambda';
import { getDb, litters, eq } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);

  const id = event.pathParameters?.id;

  if (!id) {
    throw new ApiError('Litter ID is required', 400);
  }

  try {
    const db = getDb();

    // Get existing litter to verify ownership
    const [existing] = await db.select().from(litters).where(eq(litters.id, id)).limit(1);

    if (!existing) {
      throw new ApiError('Litter not found', 404);
    }

    // Verify ownership
    if (existing.breederId !== userId) {
      throw new ApiError('Not authorized to delete this litter', 403);
    }

    // Delete the litter
    await db.delete(litters).where(eq(litters.id, id));

    return successResponse({ message: 'Litter deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error deleting litter:', error);
    throw new ApiError('Failed to delete litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
