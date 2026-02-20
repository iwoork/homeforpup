import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, kennels, eq, or, sql, and } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

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

    const db = getDb();

    // Fetch all kennels, then filter by ownership in-memory
    // This matches the original DynamoDB scan behavior
    let allKennels = await db.select().from(kennels);

    // Filter by user's kennels - check multiple ownership fields for backward compatibility
    let filteredKennels = allKennels.filter((kennel: any) => {
      const ownersArr = Array.isArray(kennel.owners) ? kennel.owners : (kennel.owners ? [kennel.owners] : []);
      const managersArr = Array.isArray(kennel.managers) ? kennel.managers : (kennel.managers ? [kennel.managers] : []);
      return (
        kennel.ownerId === userId ||
        kennel.createdBy === userId ||
        ownersArr.includes(userId) ||
        managersArr.includes(userId)
      );
    });

    // Apply additional filters
    if (search) {
      const searchLower = search.toLowerCase();
      filteredKennels = filteredKennels.filter((kennel: any) =>
        kennel.name?.toLowerCase().includes(searchLower) ||
        kennel.description?.toLowerCase().includes(searchLower) ||
        kennel.businessName?.toLowerCase().includes(searchLower)
      );
    }

    if (status) {
      filteredKennels = filteredKennels.filter((kennel: any) => kennel.status === status);
    }

    if (verified !== undefined) {
      const verifiedBool = verified === 'true';
      filteredKennels = filteredKennels.filter((kennel: any) => kennel.verified === verifiedBool);
    }

    if (specialty) {
      filteredKennels = filteredKennels.filter((kennel: any) =>
        kennel.specialties && (kennel.specialties as string[]).includes(specialty)
      );
    }

    if (city) {
      filteredKennels = filteredKennels.filter((kennel: any) =>
        kennel.address && (kennel.address as any).city === city
      );
    }

    if (state) {
      filteredKennels = filteredKennels.filter((kennel: any) =>
        kennel.address && (kennel.address as any).state === state
      );
    }

    // Sort by updatedAt descending
    filteredKennels.sort(
      (a: any, b: any) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );

    // Apply pagination
    const limitNum = parseInt(limit);
    const offsetNum = parseInt(offset);
    const paginatedKennels = filteredKennels.slice(offsetNum, offsetNum + limitNum);

    return successResponse({
      kennels: paginatedKennels,
      total: filteredKennels.length,
      count: paginatedKennels.length,
      hasMore: filteredKennels.length > offsetNum + limitNum,
    });
  } catch (error) {
    console.error('Error listing kennels:', error);
    return errorResponse('Failed to list kennels', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
