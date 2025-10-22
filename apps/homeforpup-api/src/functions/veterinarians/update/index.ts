import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { Veterinarian } from '@homeforpup/shared-types';
import { getUserIdFromEvent } from '../../../middleware/auth';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.VETERINARIANS_TABLE || 'Veterinarians';

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

    // First, get the existing veterinarian
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: veterinarianId
      }
    });

    const existingResult = await docClient.send(getCommand);

    if (!existingResult.Item) {
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

    const existingVeterinarian = existingResult.Item as Veterinarian;

    // Merge existing data with update data
    const updatedVeterinarian: Veterinarian = {
      ...existingVeterinarian,
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

    // Save updated veterinarian to DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedVeterinarian
    }));

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
