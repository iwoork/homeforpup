import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, vetVisits } from '../../../shared/dynamodb';
import { VetVisit } from '@homeforpup/shared-types';

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log('Vet visit create request:', JSON.stringify(event, null, 2));

  try {
    // Parse request body
    const vetVisitData = JSON.parse(event.body || '{}') as Partial<VetVisit>;

    // Validate required fields
    if (!vetVisitData.dogId) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: dogId'
        })
      };
    }

    if (!vetVisitData.visitDate) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: visitDate'
        })
      };
    }

    if (!vetVisitData.vetName) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: vetName'
        })
      };
    }

    if (!vetVisitData.vetClinic) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: vetClinic'
        })
      };
    }

    if (!vetVisitData.reason) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
          'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
        },
        body: JSON.stringify({
          error: 'Missing required field: reason'
        })
      };
    }

    // Generate ID
    const id = `vet_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Create vet visit object
    const vetVisit: VetVisit = {
      id,
      dogId: vetVisitData.dogId,
      ownerId: vetVisitData.ownerId || '',
      kennelId: vetVisitData.kennelId,
      visitDate: vetVisitData.visitDate,
      vetName: vetVisitData.vetName,
      vetClinic: vetVisitData.vetClinic,
      visitType: vetVisitData.visitType || 'routine',
      reason: vetVisitData.reason,
      diagnosis: vetVisitData.diagnosis,
      treatment: vetVisitData.treatment,
      medications: vetVisitData.medications || [],
      weight: vetVisitData.weight,
      temperature: vetVisitData.temperature,
      followUpRequired: vetVisitData.followUpRequired || false,
      followUpDate: vetVisitData.followUpDate,
      followUpNotes: vetVisitData.followUpNotes,
      cost: vetVisitData.cost,
      currency: vetVisitData.currency || 'USD',
      paid: vetVisitData.paid || false,
      documents: vetVisitData.documents || [],
      notes: vetVisitData.notes,
      status: vetVisitData.status || 'completed',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to database
    const db = getDb();
    await db.insert(vetVisits).values(vetVisit as any);

    console.log('Vet visit created successfully:', id);

    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS'
      },
      body: JSON.stringify({
        vetVisit
      })
    };

  } catch (error) {
    console.error('Error creating vet visit:', error);

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
