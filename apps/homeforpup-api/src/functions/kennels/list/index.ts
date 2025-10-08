import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, ScanCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Temporarily make authentication optional for testing
  // TODO: Re-enable required auth once Cognito authorizer is working
  let userId: string | null = null;
  try {
    userId = getUserIdFromEvent(event as any);
  } catch (error: any) {
    // Continue without user context if not authenticated
    console.log('No authenticated user, showing all kennels');
  }

  // Parse query parameters
  const queryParams = event.queryStringParameters || {};
  const {
    search,
    status,
    verified,
    specialty,
    city,
    state,
    limit = '20',
    offset = '0',
  } = queryParams;

  try {
    // Build filter expression
    let filterExpression = '';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's kennels only if authenticated
    if (userId) {
      filterExpression = 'contains(owners, :userId) OR contains(managers, :userId)';
      expressionAttributeValues[':userId'] = userId;
    }

    if (search) {
      filterExpression += ' AND (contains(#name, :search) OR contains(description, :search) OR contains(businessName, :search))';
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    if (status) {
      filterExpression += ' AND #status = :status';
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (verified !== undefined) {
      filterExpression += ' AND verified = :verified';
      expressionAttributeValues[':verified'] = verified === 'true';
    }

    if (specialty) {
      filterExpression += ' AND contains(specialties, :specialty)';
      expressionAttributeValues[':specialty'] = specialty;
    }

    if (city) {
      filterExpression += ' AND address.city = :city';
      expressionAttributeValues[':city'] = city;
    }

    if (state) {
      filterExpression += ' AND address.#state = :state';
      expressionAttributeNames['#state'] = 'state';
      expressionAttributeValues[':state'] = state;
    }

    const scanCommand = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: filterExpression || undefined,
      ExpressionAttributeNames:
        Object.keys(expressionAttributeNames).length > 0
          ? expressionAttributeNames
          : undefined,
      ExpressionAttributeValues:
        Object.keys(expressionAttributeValues).length > 0
          ? expressionAttributeValues
          : undefined,
    });

    const result = await dynamodb.send(scanCommand);
    const kennels = (result.Items as any[]) || [];

    // Sort by updatedAt descending
    kennels.sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedKennels = kennels.slice(offsetNum, offsetNum + limitNum);

    return successResponse({
      kennels: paginatedKennels,
      total: kennels.length,
      count: paginatedKennels.length,
      hasMore: kennels.length > offsetNum + limitNum,
    });
  } catch (error) {
    console.error('Error listing kennels:', error);
    return errorResponse('Failed to list kennels', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

