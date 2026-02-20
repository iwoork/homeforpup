import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, profiles, eq } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const currentUserId = getUserIdFromEvent(event);
  const targetUserId = event.pathParameters?.id;

  console.log('Profile update request:', {
    currentUserId,
    targetUserId,
    userIdsMatch: currentUserId === targetUserId,
    hasAuthorizer: !!event.requestContext.authorizer,
    authContext: event.requestContext.authorizer ? {
      sub: event.requestContext.authorizer.sub,
      email: event.requestContext.authorizer.email,
    } : null,
  });

  if (!targetUserId) {
    throw new ApiError('User ID is required', 400);
  }

  // Users can only update their own profile (unless admin)
  if (currentUserId !== targetUserId) {
    console.error('User ID mismatch:', {
      currentUserId,
      targetUserId,
      error: 'User can only update their own profile',
    });
    throw new ApiError('Forbidden: You can only update your own profile', 403);
  }

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const updates = JSON.parse(event.body);

    // Don't allow updating certain system-managed fields
    const disallowedFields = [
      'userId',
      'email',
      'createdAt',
      'passwordHash',
      'refreshToken',
      'username',
      'userType',
    ];
    disallowedFields.forEach(field => delete updates[field]);

    // Add updatedAt
    updates.updatedAt = new Date().toISOString();

    const db = getDb();

    // Try to update existing profile, or insert if it doesn't exist (upsert behavior)
    const [existing] = await db.select().from(profiles).where(eq(profiles.userId, targetUserId)).limit(1);

    let profile: any;

    if (existing) {
      // Update existing profile
      const [updated] = await db.update(profiles).set(updates).where(eq(profiles.userId, targetUserId)).returning();
      profile = { ...updated };
    } else {
      // Insert new profile (upsert behavior like the original if_not_exists for createdAt)
      const newProfile = {
        userId: targetUserId,
        ...updates,
        createdAt: new Date().toISOString(),
      };
      const [inserted] = await db.insert(profiles).values(newProfile).returning();
      profile = { ...inserted };
    }

    // Remove sensitive fields
    delete profile.passwordHash;
    delete profile.refreshToken;

    return successResponse({
      profile,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating profile:', error);
    throw new ApiError('Failed to update profile', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
