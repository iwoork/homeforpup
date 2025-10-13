import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const PROFILES_TABLE = process.env.PROFILES_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.pathParameters?.id;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: PROFILES_TABLE,
      Key: { userId },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      throw new ApiError('Profile not found', 404);
    }

    // Profile data (application-specific data)
    // Note: Identity fields (firstName, lastName, username, picture, phone, address, bio)
    // should be fetched from Cognito user attributes separately
    const profile = { ...result.Item };
    
    // Remove any sensitive fields that shouldn't be exposed
    delete profile.passwordHash;
    delete profile.refreshToken;

    return successResponse({
      profile,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting profile:', error);
    throw new ApiError('Failed to get profile', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

