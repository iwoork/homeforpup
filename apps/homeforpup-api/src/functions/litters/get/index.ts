import { APIGatewayProxyResult } from 'aws-lambda';
import { getDb, litters, eq } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id;

  if (!id) {
    throw new ApiError('Litter ID is required', 400);
  }

  try {
    const db = getDb();

    const [litter] = await db.select().from(litters).where(eq(litters.id, id)).limit(1);

    if (!litter) {
      throw new ApiError('Litter not found', 404);
    }

    return successResponse({ litter });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting litter:', error);
    throw new ApiError('Failed to get litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
