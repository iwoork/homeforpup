import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, PutCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const LITTERS_TABLE = process.env.LITTERS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);

  const id = event.pathParameters?.id;

  if (!id) {
    throw new ApiError('Litter ID is required', 400);
  }

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    // Get existing litter
    const getCommand = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id },
    });

    const existingResult = await dynamodb.send(getCommand);

    if (!existingResult.Item) {
      throw new ApiError('Litter not found', 404);
    }

    // Verify ownership
    if (existingResult.Item.breederId !== userId) {
      throw new ApiError('Not authorized to update this litter', 403);
    }

    const updateData = JSON.parse(event.body);

    // Update litter object
    const updatedLitter = {
      ...existingResult.Item,
      ...updateData,
      id, // Ensure ID doesn't change
      breederId: existingResult.Item.breederId, // Ensure breederId doesn't change
      createdAt: existingResult.Item.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    // Save to DynamoDB
    const putCommand = new PutCommand({
      TableName: LITTERS_TABLE,
      Item: updatedLitter,
    });

    await dynamodb.send(putCommand);

    return successResponse({ litter: updatedLitter });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating litter:', error);
    throw new ApiError('Failed to update litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

