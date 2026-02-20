import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, ScanCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication to list user's kennels
  let userId: string | null = null;
  try {
    userId = getUserIdFromEvent(event as any);
  } catch (error: any) {
    return errorResponse('Unauthorized: Please log in to view your kennels', 401);
  }

  if (!userId) {
    return errorResponse('Unauthorized: Please log in to view your kennels', 401);
  }

  // Check if user is a breeder
  const userType = (event as any).requestContext.authorizer?.userType;
  if (userType !== 'breeder') {
    return errorResponse('Forbidden: Only breeders can access kennels', 403);
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
    console.log('Listing kennels for user:', userId);

    // Build filter expression
    let filterExpression = '';
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's kennels - check multiple ownership fields for backward compatibility
    filterExpression = 'ownerId = :userId OR createdBy = :userId OR contains(owners, :userId) OR contains(managers, :userId)';
    expressionAttributeValues[':userId'] = userId;

    // Wrap additional filters in parentheses for proper operator precedence
    if (search) {
      const searchFilter = ' AND (contains(#name, :search) OR contains(description, :search) OR contains(businessName, :search))';
      filterExpression = `(${filterExpression})${searchFilter}`;
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    if (status) {
      if (search) {
        filterExpression += ' AND #status = :status';
      } else {
        filterExpression = `(${filterExpression}) AND #status = :status`;
      }
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    if (verified !== undefined) {
      if (search || status) {
        filterExpression += ' AND verified = :verified';
      } else {
        filterExpression = `(${filterExpression}) AND verified = :verified`;
      }
      expressionAttributeValues[':verified'] = verified === 'true';
    }

    if (specialty) {
      if (search || status || verified !== undefined) {
        filterExpression += ' AND contains(specialties, :specialty)';
      } else {
        filterExpression = `(${filterExpression}) AND contains(specialties, :specialty)`;
      }
      expressionAttributeValues[':specialty'] = specialty;
    }

    if (city) {
      if (search || status || verified !== undefined || specialty) {
        filterExpression += ' AND address.city = :city';
      } else {
        filterExpression = `(${filterExpression}) AND address.city = :city`;
      }
      expressionAttributeValues[':city'] = city;
    }

    if (state) {
      if (search || status || verified !== undefined || specialty || city) {
        filterExpression += ' AND address.#state = :state';
      } else {
        filterExpression = `(${filterExpression}) AND address.#state = :state`;
      }
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

