import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, UpdateCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const USERS_TABLE = process.env.USERS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const currentUserId = getUserIdFromEvent(event);
  const targetUserId = event.pathParameters?.id;

  if (!targetUserId) {
    throw new ApiError('User ID is required', 400);
  }

  // Users can only update their own profile (unless admin)
  if (currentUserId !== targetUserId) {
    throw new ApiError('Forbidden: You can only update your own profile', 403);
  }

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const updates = JSON.parse(event.body);
    
    // Don't allow updating certain fields
    const disallowedFields = ['userId', 'email', 'createdAt', 'passwordHash', 'refreshToken'];
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

    const updateCommand = new UpdateCommand({
      TableName: USERS_TABLE,
      Key: { userId: targetUserId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(updateCommand);

    // Remove sensitive fields
    const user = { ...result.Attributes };
    delete user.passwordHash;
    delete user.refreshToken;

    return successResponse({
      user,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating user:', error);
    throw new ApiError('Failed to update user', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

