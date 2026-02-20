import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, UpdateCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const PROFILES_TABLE = process.env.PROFILES_TABLE!;

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

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    // Add updatedAt
    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    // Add createdAt if profile doesn't exist (upsert behavior)
    updateExpressions.push(`#createdAt = if_not_exists(#createdAt, :createdAt)`);
    expressionAttributeNames['#createdAt'] = 'createdAt';
    expressionAttributeValues[':createdAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: targetUserId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(updateCommand);

    // Remove sensitive fields
    const profile = { ...result.Attributes };
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

