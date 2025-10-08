import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, UpdateCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const DOGS_TABLE = process.env.DOGS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);
  const dogId = event.pathParameters?.id;

  if (!dogId) {
    throw new ApiError('Dog ID is required', 400);
  }

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    // First, check if the dog exists and user has permission
    const getCommand = new GetCommand({
      TableName: DOGS_TABLE,
      Key: { id: dogId },
    });

    const existing = await dynamodb.send(getCommand);

    if (!existing.Item) {
      throw new ApiError('Dog not found', 404);
    }

    // Check ownership (support both ownerId and kennelOwners)
    const hasOwnership = existing.Item.ownerId === userId || 
                        (existing.Item.kennelOwners && existing.Item.kennelOwners.includes(userId));
    
    if (!hasOwnership) {
      throw new ApiError('Forbidden: You do not have permission to update this dog', 403);
    }

    const updates = JSON.parse(event.body);
    
    // Don't allow updating certain fields
    delete updates.id;
    delete updates.dogId;
    delete updates.ownerId;
    delete updates.createdAt;

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
      TableName: DOGS_TABLE,
      Key: { id: dogId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(updateCommand);

    return successResponse({
      dog: result.Attributes,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating dog:', error);
    throw new ApiError('Failed to update dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

