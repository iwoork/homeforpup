import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const DOGS_TABLE = process.env.DOGS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { dogId },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      throw new ApiError('Dog not found', 404);
    }

    return successResponse({
      dog: result.Item,
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

