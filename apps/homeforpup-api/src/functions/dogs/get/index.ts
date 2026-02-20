import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, dogs, kennels, eq } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  try {
    const db = getDb();

    const [dog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!dog) {
      throw new ApiError('Dog not found', 404);
    }

    // Fetch kennel information if kennelId exists
    let kennel = null;
    if (dog.kennelId) {
      try {
        const [kennelResult] = await db.select().from(kennels).where(eq(kennels.id, dog.kennelId)).limit(1);
        if (kennelResult) {
          kennel = kennelResult;
        }
      } catch (kennelError) {
        console.warn(`Failed to fetch kennel ${dog.kennelId} for dog ${dogId}:`, kennelError);
        // Continue without kennel data - don't fail the entire request
      }
    }

    return successResponse({
      dog,
      kennel, // Include kennel information in the response
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting dog:', error);
    throw new ApiError('Failed to get dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
