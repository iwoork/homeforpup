import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, DeleteCommand } from '../../../shared/dynamodb';
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

  try {
    // Get existing litter to verify ownership
    const getCommand = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id },
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      throw new ApiError('Litter not found', 404);
    }

    // Verify ownership
    if (result.Item.breederId !== userId) {
      throw new ApiError('Not authorized to delete this litter', 403);
    }

    // Delete the litter
    const deleteCommand = new DeleteCommand({
      TableName: LITTERS_TABLE,
      Key: { id },
    });

    await dynamodb.send(deleteCommand);

    return successResponse({ message: 'Litter deleted successfully' });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error deleting litter:', error);
    throw new ApiError('Failed to delete litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

