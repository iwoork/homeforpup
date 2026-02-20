import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, dogs, kennels, eq, inArray } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

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
    const db = getDb();

    let items: any[];

    if (breederId) {
      // Query by breeder ID (breederId maps to ownerId in the dogs table)
      items = await db.select().from(dogs).where(eq(dogs.ownerId, breederId));
    } else if (kennelId) {
      // Query by kennel ID
      items = await db.select().from(dogs).where(eq(dogs.kennelId, kennelId));
    } else {
      // Full scan to get all dogs
      items = await db.select().from(dogs);
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
    )] as string[];

    let kennelsMap: Record<string, any> = {};

    if (kennelIds.length > 0) {
      try {
        // Batch fetch kennels using inArray
        const kennelResults = await db.select().from(kennels).where(inArray(kennels.id, kennelIds));

        // Build kennels map
        kennelResults.forEach((kennel: any) => {
          kennelsMap[kennel.id] = kennel;
        });
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
