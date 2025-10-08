import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';

const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: kennelId },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      return errorResponse('Kennel not found', 404);
    }

    return successResponse({ kennel: result.Item });
  } catch (error) {
    console.error('Error getting kennel:', error);
    return errorResponse('Failed to get kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

