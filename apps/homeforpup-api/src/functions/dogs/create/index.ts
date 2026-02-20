import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, dogs, kennels, eq } from '../../../shared/dynamodb';
import { successResponse, errorResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const dogData = JSON.parse(event.body);

    // Validate required fields
    if (!dogData.name || !dogData.breed || !dogData.kennelId) {
      throw new ApiError('Missing required fields: name, breed, kennelId', 400);
    }

    const db = getDb();

    // Verify user has access to the kennel
    const [kennel] = await db.select().from(kennels).where(eq(kennels.id, dogData.kennelId)).limit(1);

    if (!kennel) {
      throw new ApiError('Kennel not found', 404);
    }

    const hasAccess =
      (kennel.owners && (kennel.owners as string[]).includes(userId)) ||
      (kennel.managers && (kennel.managers as string[]).includes(userId)) ||
      kennel.ownerId === userId || // backward compatibility
      kennel.createdBy === userId; // backward compatibility

    if (!hasAccess) {
      throw new ApiError('Forbidden: You do not have access to this kennel', 403);
    }

    // Create dog object
    const dog = {
      id: uuidv4(),
      ...dogData,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to database
    await db.insert(dogs).values(dog);

    // Return dog with kennel information
    return successResponse({
      dog,
      kennel // Kennel was already fetched during validation
    }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error creating dog:', error);
    throw new ApiError('Failed to create dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
