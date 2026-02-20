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

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const db = getDb();

    // Get existing litter
    const [existing] = await db.select().from(litters).where(eq(litters.id, id)).limit(1);

    if (!existing) {
      throw new ApiError('Litter not found', 404);
    }

    // Verify ownership
    if (existing.breederId !== userId) {
      throw new ApiError('Not authorized to update this litter', 403);
    }

    const updateData = JSON.parse(event.body);

    // Update litter object
    const updatedLitter = {
      ...existing,
      ...updateData,
      id, // Ensure ID doesn't change
      breederId: existing.breederId, // Ensure breederId doesn't change
      createdAt: existing.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await db.update(litters).set(updatedLitter).where(eq(litters.id, id));

    return successResponse({ litter: updatedLitter });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating litter:', error);
    throw new ApiError('Failed to update litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
