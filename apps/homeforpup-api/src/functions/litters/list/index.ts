import { APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, ScanCommand, QueryCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const LITTERS_TABLE = process.env.LITTERS_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const userId = getUserIdFromEvent(event);

  try {
    const params = event.queryStringParameters || {};
    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    
    // Query parameters
    const breederId = params.breederId || userId; // Default to current user
    const breed = params.breed;
    const status = params.status;
    const search = params.search;

    let command;
    
    // If querying by breederId, use Query for better performance
    if (breederId) {
      const filterExpressions: string[] = [];
      const expressionAttributeNames: Record<string, string> = {};
      const expressionAttributeValues: Record<string, any> = {
        ':breederId': breederId,
      };

      if (breed) {
        filterExpressions.push('#breed = :breed');
        expressionAttributeNames['#breed'] = 'breed';
        expressionAttributeValues[':breed'] = breed;
      }

      if (status) {
        filterExpressions.push('#status = :status');
        expressionAttributeNames['#status'] = 'status';
        expressionAttributeValues[':status'] = status;
      }

      if (search) {
        filterExpressions.push('contains(#breed, :search) OR contains(description, :search)');
        expressionAttributeNames['#breed'] = 'breed';
        expressionAttributeValues[':search'] = search;
      }

      command = new ScanCommand({
        TableName: LITTERS_TABLE,
        FilterExpression: `breederId = :breederId${filterExpressions.length > 0 ? ' AND (' + filterExpressions.join(' OR ') + ')' : ''}`,
        ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
        ExpressionAttributeValues: expressionAttributeValues,
      });
    } else {
      // Scan all litters (admin use case)
      command = new ScanCommand({
        TableName: LITTERS_TABLE,
      });
    }

    const result = await dynamodb.send(command);
    const litters = result.Items || [];

    // Sort by createdAt descending (newest first)
    litters.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLitters = litters.slice(startIndex, endIndex);
    const total = litters.length;

    return successResponse({
      litters: paginatedLitters,
      total,
      count: paginatedLitters.length,
      page,
      limit,
      hasNextPage: endIndex < total,
      hasPrevPage: page > 1,
      totalPages: Math.ceil(total / limit),
      hasMore: endIndex < total,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    console.error('Error listing litters:', error);
    throw new ApiError('Failed to list litters', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

