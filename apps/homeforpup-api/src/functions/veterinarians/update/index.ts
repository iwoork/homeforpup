import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, veterinarians, eq } from '../../../shared/dynamodb';
import { Veterinarian } from '@homeforpup/shared-types';
import { getUserIdFromEvent } from '../../../middleware/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Veterinarian update request:', JSON.stringify(event, null, 2));

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

    const veterinarianId = event.pathParameters?.id;

    if (!veterinarianId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing veterinarian ID'
        })
      };
    }

    // Parse request body
    const updateData = JSON.parse(event.body || '{}') as Partial<Veterinarian>;

    const db = getDb();

    // First, get the existing veterinarian
    const [existingVeterinarian] = await db.select().from(veterinarians).where(eq(veterinarians.id, veterinarianId)).limit(1);

    if (!existingVeterinarian) {
      return {
        statusCode: 404,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Veterinarian not found'
        })
      };
    }

    // Merge existing data with update data
    const updatedVeterinarian: Veterinarian = {
      ...(existingVeterinarian as any),
      ...updateData,
      id: veterinarianId, // Ensure ID doesn't change
      createdAt: existingVeterinarian.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString() // Update timestamp
    };

    // Validate required fields are still present
    if (!updatedVeterinarian.name || !updatedVeterinarian.clinic) {
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

    // Save updated veterinarian to database
    await db.update(veterinarians).set(updatedVeterinarian as any).where(eq(veterinarians.id, veterinarianId));

    console.log('Veterinarian updated successfully:', veterinarianId);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        veterinarian: updatedVeterinarian
      })
    };

  } catch (error) {
    console.error('Error updating veterinarian:', error);

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
