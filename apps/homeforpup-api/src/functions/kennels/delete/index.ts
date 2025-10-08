import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand, DeleteCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  let userId: string;
  try {
    userId = getUserIdFromEvent(event as any);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Unauthorized', 401);
  }

  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  try {
    // Get existing kennel to check ownership
    const getCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const result = await dynamodb.send(getCommand);

    if (!result.Item) {
      return errorResponse('Kennel not found', 404);
    }

    const existingKennel = result.Item;

    // Check if user is owner (only owners can delete)
    const isOwner = existingKennel.owners?.includes(userId);

    if (!isOwner) {
      return errorResponse('Forbidden: Only kennel owners can delete kennels', 403);
    }

    // Delete kennel
    await dynamodb.send(
      new DeleteCommand({
        TableName: KENNELS_TABLE,
        Key: { id: kennelId },
      })
    );

    return successResponse({ message: 'Kennel deleted successfully' });
  } catch (error) {
    console.error('Error deleting kennel:', error);
    return errorResponse('Failed to delete kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

