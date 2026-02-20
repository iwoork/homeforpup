import { APIGatewayProxyResult } from 'aws-lambda';
import { getDb, litters, eq, and } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

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

    const db = getDb();

    // Fetch litters (filter by breederId at query level when possible)
    let allLitters: any[];
    if (breederId) {
      allLitters = await db.select().from(litters).where(eq(litters.breederId, breederId));
    } else {
      // Scan all litters (admin use case)
      allLitters = await db.select().from(litters);
    }

    // Apply additional filters in-memory (matching original behavior)
    let filteredLitters = allLitters;

    if (breed) {
      filteredLitters = filteredLitters.filter((l: any) => l.breed === breed);
    }

    if (status) {
      filteredLitters = filteredLitters.filter((l: any) => l.status === status);
    }

    if (search) {
      const searchLower = search.toLowerCase();
      filteredLitters = filteredLitters.filter((l: any) =>
        l.breed?.toLowerCase().includes(searchLower) ||
        l.description?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by createdAt descending (newest first)
    filteredLitters.sort((a: any, b: any) => {
      const dateA = new Date(a.createdAt || 0).getTime();
      const dateB = new Date(b.createdAt || 0).getTime();
      return dateB - dateA;
    });

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedLitters = filteredLitters.slice(startIndex, endIndex);
    const total = filteredLitters.length;

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
