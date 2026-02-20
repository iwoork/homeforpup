import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, vetVisits, eq } from '../../../shared/dynamodb';
import { VetVisit } from '@homeforpup/shared-types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Vet visit update request:', JSON.stringify(event, null, 2));

  try {
    const vetVisitId = event.pathParameters?.id;

    if (!vetVisitId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing vet visit ID'
        })
      };
    }

    // Parse request body
    const updateData = JSON.parse(event.body || '{}') as Partial<VetVisit>;

    const db = getDb();

    // First, get the existing vet visit
    const [existingVetVisit] = await db.select().from(vetVisits).where(eq(vetVisits.id, vetVisitId)).limit(1);

    if (!existingVetVisit) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Vet visit not found'
        })
      };
    }

    // Merge existing data with update data
    const updatedVetVisit: VetVisit = {
      ...(existingVetVisit as any),
      ...updateData,
      id: vetVisitId, // Ensure ID doesn't change
      createdAt: existingVetVisit.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString() // Update timestamp
    };

    // Validate required fields are still present
    if (!updatedVetVisit.dogId || !updatedVetVisit.visitDate ||
        !updatedVetVisit.vetName || !updatedVetVisit.vetClinic ||
        !updatedVetVisit.reason) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required fields after update'
        })
      };
    }

    // Save updated vet visit to database
    await db.update(vetVisits).set(updatedVetVisit as any).where(eq(vetVisits.id, vetVisitId));

    console.log('Vet visit updated successfully:', vetVisitId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        vetVisit: updatedVetVisit
      })
    };

  } catch (error) {
    console.error('Error updating vet visit:', error);

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
