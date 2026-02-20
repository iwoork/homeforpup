import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, vetVisits, eq } from '../../../shared/dynamodb';
import { VetVisit } from '@homeforpup/shared-types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Vet visits list request:', JSON.stringify(event, null, 2));

  try {
    const queryParams = event.queryStringParameters || {};
    const dogId = queryParams.dogId;
    const ownerId = queryParams.ownerId;
    const page = parseInt(queryParams.page || '1');
    const limit = parseInt(queryParams.limit || '50');
    const visitType = queryParams.visitType;
    const status = queryParams.status;

    const db = getDb();

    let allVisits: any[];

    if (dogId) {
      // Query by dogId
      allVisits = await db.select().from(vetVisits).where(eq(vetVisits.dogId, dogId));
    } else if (ownerId) {
      // Query by ownerId
      allVisits = await db.select().from(vetVisits).where(eq(vetVisits.ownerId, ownerId));
    } else {
      // Scan all vet visits (for admin purposes)
      allVisits = await db.select().from(vetVisits);
    }

    // Apply additional filters
    if (visitType) {
      allVisits = allVisits.filter((visit: any) => visit.visitType === visitType);
    }

    if (status) {
      allVisits = allVisits.filter((visit: any) => visit.status === status);
    }

    // Sort by visit date (most recent first)
    allVisits.sort((a: any, b: any) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

    // Calculate pagination
    const total = allVisits.length;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVisits = allVisits.slice(startIndex, endIndex);

    console.log(`Found ${total} vet visits, returning ${paginatedVisits.length}`);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        vetVisits: paginatedVisits,
        page,
        limit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage
      })
    };

  } catch (error) {
    console.error('Error listing vet visits:', error);

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
