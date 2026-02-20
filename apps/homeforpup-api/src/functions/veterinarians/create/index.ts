import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, veterinarians } from '../../../shared/dynamodb';
import { Veterinarian } from '@homeforpup/shared-types';
import { getUserIdFromEvent } from '../../../middleware/auth';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Veterinarian create request:', JSON.stringify(event, null, 2));

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
    // Parse request body
    const veterinarianData = JSON.parse(event.body || '{}') as Partial<Veterinarian>;

    // Validate required fields
    if (!veterinarianData.name) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: name'
        })
      };
    }

    if (!veterinarianData.clinic) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: clinic'
        })
      };
    }

    // Generate ID
    const id = `vet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create veterinarian object
    const veterinarian: Veterinarian = {
      id,
      ownerId: userId,
      name: veterinarianData.name,
      clinic: veterinarianData.clinic,
      phone: veterinarianData.phone,
      email: veterinarianData.email,
      address: veterinarianData.address,
      city: veterinarianData.city,
      state: veterinarianData.state,
      zipCode: veterinarianData.zipCode,
      country: veterinarianData.country,
      specialties: veterinarianData.specialties || [],
      notes: veterinarianData.notes,
      isActive: veterinarianData.isActive !== undefined ? veterinarianData.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const db = getDb();
    await db.insert(veterinarians).values(veterinarian as any);

    console.log('Veterinarian created successfully:', id);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        veterinarian
      })
    };

  } catch (error) {
    console.error('Error creating veterinarian:', error);

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
