import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, PutCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

const DOGS_TABLE = process.env.DOGS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const dogData = JSON.parse(event.body);

    // Validate required fields
    if (!dogData.name || !dogData.breed || !dogData.kennelId) {
      throw new ApiError('Missing required fields: name, breed, kennelId', 400);
    }

    // Create dog object
    const dog = {
      dogId: uuidv4(),
      ...dogData,
      ownerId: userId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to DynamoDB
    const command = new PutCommand({
      TableName: DOGS_TABLE,
      Item: dog,
    });

    await dynamodb.send(command);

    return successResponse({ dog }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error creating dog:', error);
    throw new ApiError('Failed to create dog', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

