import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, QueryCommand, ScanCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const DOGS_TABLE = process.env.DOGS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Parse query parameters
  const queryParams = event.queryStringParameters || {};
  const {
    kennelId,
    type,
    gender,
    breed,
    status,
    breedingStatus,
    page = '1',
    limit = '20',
    sortBy = 'updatedAt',
  } = queryParams;

  // If authenticated, get user ID
  let userId: string | null = null;
  try {
    userId = getUserIdFromEvent(event as any);
  } catch {
    // Not authenticated, continue without user context
  }

  try {
    let items = [];
    
    if (kennelId) {
      // Query by kennel ID
      const command = new QueryCommand({
        TableName: DOGS_TABLE,
        IndexName: 'KennelIdIndex',
        KeyConditionExpression: 'kennelId = :kennelId',
        ExpressionAttributeValues: {
          ':kennelId': kennelId,
        },
      });
      const result = await dynamodb.send(command);
      items = result.Items || [];
    } else {
      // Full scan (in production, you'd want better filtering)
      const command = new ScanCommand({
        TableName: DOGS_TABLE,
        Limit: parseInt(limit),
      });
      const result = await dynamodb.send(command);
      items = result.Items || [];
    }

    // Apply filters
    let filteredItems = items;

    if (type) {
      filteredItems = filteredItems.filter((item: any) => item.dogType === type);
    }
    if (gender) {
      filteredItems = filteredItems.filter((item: any) => item.gender === gender);
    }
    if (breed) {
      filteredItems = filteredItems.filter((item: any) => item.breed === breed);
    }
    if (status) {
      filteredItems = filteredItems.filter((item: any) => item.status === status);
    }
    if (breedingStatus) {
      filteredItems = filteredItems.filter(
        (item: any) => item.breedingStatus === breedingStatus
      );
    }

    // Sort
    filteredItems.sort((a: any, b: any) => {
      const aVal = a[sortBy] || 0;
      const bVal = b[sortBy] || 0;
      return bVal - aVal; // Descending
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedItems = filteredItems.slice(startIndex, endIndex);

    return successResponse({
      dogs: paginatedItems,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total: filteredItems.length,
        totalPages: Math.ceil(filteredItems.length / limitNum),
      },
    });
  } catch (error) {
    console.error('Error listing dogs:', error);
    return errorResponse('Failed to list dogs', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

