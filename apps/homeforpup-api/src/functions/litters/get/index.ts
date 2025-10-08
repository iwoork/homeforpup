import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, GetCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const LITTERS_TABLE = process.env.LITTERS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  const id = event.pathParameters?.id;

  if (!id) {
    throw new ApiError('Litter ID is required', 400);
  }

  try {
    const command = new GetCommand({
      TableName: LITTERS_TABLE,
      Key: { id },
    });

    const result = await dynamodb.send(command);

    if (!result.Item) {
      throw new ApiError('Litter not found', 404);
    }

    return successResponse({ litter: result.Item });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error getting litter:', error);
    throw new ApiError('Failed to get litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

