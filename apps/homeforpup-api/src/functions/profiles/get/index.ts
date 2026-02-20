import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, profiles, eq } from '../../../shared/dynamodb';
import { successResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const userId = event.pathParameters?.id;

  if (!userId) {
    throw new ApiError('User ID is required', 400);
  }

  try {
    const db = getDb();

    const [result] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (!result) {
      throw new ApiError('Profile not found', 404);
    }

    // Profile data (application-specific data)
    // Note: Identity fields (firstName, lastName, username, picture, phone, address, bio)
    // should be fetched from Cognito user attributes separately
    const profile = { ...result } as any;

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
