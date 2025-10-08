import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const USERS_TABLE = process.env.USERS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.pathParameters?.id;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: USERS_TABLE,
      Key: { userId },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      throw new ApiError('User not found', 404);
    }

    // Remove sensitive fields for public view
    const user = { ...result.Item };
    delete user.passwordHash;
    delete user.refreshToken;

    return successResponse({
      user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting user:', error);
    throw new ApiError('Failed to get user', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

