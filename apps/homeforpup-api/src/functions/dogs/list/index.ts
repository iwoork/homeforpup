import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, QueryCommand, ScanCommand, BatchGetCommand } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const DOGS_TABLE = process.env.DOGS_TABLE!;
const KENNELS_TABLE = process.env.KENNELS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Parse query parameters
  const queryParams = event.queryStringParameters || {};
  const {
    kennelId,
    ownerId,
    breederId,
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
    
    if (breederId) {
      // Query by breeder ID using GSI (if data has breederId field)
      const command = new QueryCommand({
        TableName: DOGS_TABLE,
        IndexName: 'BreederIndex',
        KeyConditionExpression: 'breederId = :breederId',
        ExpressionAttributeValues: {
          ':breederId': breederId,
        },
      });
      const result = await dynamodb.send(command);
      items = result.Items || [];
    } else if (kennelId) {
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
      // Full scan to get all dogs
      const command = new ScanCommand({
        TableName: DOGS_TABLE,
      });
      const result = await dynamodb.send(command);
      items = result.Items || [];
    }

    // Apply filters
    let filteredItems = items;

    // Filter by ownerId if provided (primary filter for breeder apps)
    // Note: This checks direct ownership. Dogs can also be managed through kennel
    // ownership/management, but that requires fetching kennel data for each dog.
    // For list operations, we rely on direct ownerId match for performance.
    // TODO: Consider adding a secondary filter that checks kennel ownership
    if (ownerId) {
      filteredItems = filteredItems.filter((item: any) => item.ownerId === ownerId);
    }
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

    // Fetch kennel information for all dogs in this page
    const kennelIds = [...new Set(
      paginatedItems
        .map((dog: any) => dog.kennelId)
        .filter((id: string | undefined) => id)
    )];

    let kennelsMap: Record<string, any> = {};
    
    if (kennelIds.length > 0) {
      try {
        // Batch fetch kennels (DynamoDB BatchGet supports up to 100 items)
        const batchSize = 100;
        for (let i = 0; i < kennelIds.length; i += batchSize) {
          const batch = kennelIds.slice(i, i + batchSize);
          const batchCommand = new BatchGetCommand({
            RequestItems: {
              [KENNELS_TABLE]: {
                Keys: batch.map(id => ({ id })),
              },
            },
          });
          
          const batchResult = await dynamodb.send(batchCommand);
          const kennels = batchResult.Responses?.[KENNELS_TABLE] || [];
          
          // Build kennels map
          kennels.forEach((kennel: any) => {
            kennelsMap[kennel.id] = kennel;
          });
        }
      } catch (kennelError) {
        console.warn('Failed to batch fetch kennels:', kennelError);
        // Continue without kennel data - don't fail the entire request
      }
    }

    // Attach kennel information to each dog
    const dogsWithKennels = paginatedItems.map((dog: any) => ({
      ...dog,
      kennel: dog.kennelId ? kennelsMap[dog.kennelId] || null : null,
    }));

    return successResponse({
      dogs: dogsWithKennels,
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

