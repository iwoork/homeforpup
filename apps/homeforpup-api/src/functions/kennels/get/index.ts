import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, kennels, eq } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  try {
    const db = getDb();

    const [kennel] = await db.select().from(kennels).where(eq(kennels.id, kennelId)).limit(1);

    if (!kennel) {
      return errorResponse('Kennel not found', 404);
    }

    return successResponse({ kennel });
  } catch (error) {
    console.error('Error getting kennel:', error);
    return errorResponse('Failed to get kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
