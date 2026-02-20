import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, veterinarians, eq } from '../../../shared/dynamodb';
import { Veterinarian } from '@homeforpup/shared-types';
import { getUserIdFromEvent } from '../../../middleware/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Veterinarians list request:', JSON.stringify(event, null, 2));

  try {
    // Get user ID from JWT token
    const userId = getUserIdFromEvent(event as any);
    if (!userId) {
      return {
        statusCode: 401,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      };
    }
    const queryParams = event.queryStringParameters || {};
    const page = parseInt(queryParams.page || '1');
    const limit = parseInt(queryParams.limit || '50');
    const isActive = queryParams.isActive;

    const db = getDb();

    // Query veterinarians for the authenticated user
    let allVeterinarians = await db.select().from(veterinarians).where(eq(veterinarians.ownerId, userId));

    // Apply additional filters
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      allVeterinarians = allVeterinarians.filter((vet: any) => vet.isActive === activeFilter);
    }

    // Sort by name
    allVeterinarians.sort((a: any, b: any) => a.name.localeCompare(b.name));

    // Calculate pagination
    const total = allVeterinarians.length;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVeterinarians = allVeterinarians.slice(startIndex, endIndex);

    console.log(`Found ${total} veterinarians, returning ${paginatedVeterinarians.length}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        veterinarians: paginatedVeterinarians,
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      })
    };

  } catch (error) {
    console.error('Error listing veterinarians:', error);

    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      })
    };
  }
};
