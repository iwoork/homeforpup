import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const DOGS_TABLE = process.env.DOGS_TABLE!;
const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      throw new ApiError('Dog not found', 404);
    }

    const dog = result.Item;

    // Fetch kennel information if kennelId exists
    let kennel = null;
    if (dog.kennelId) {
      try {
        const kennelCommand = new GetCommand({
          TableName: KENNELS_TABLE,
          Key: { id: dog.kennelId },
        });
        const kennelResult = await dynamodb.send(kennelCommand);
        if (kennelResult.Item) {
          kennel = kennelResult.Item;
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

