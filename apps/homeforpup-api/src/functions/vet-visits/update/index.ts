import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';
import { VetVisit } from '@homeforpup/shared-types';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.VET_VISITS_TABLE || 'VetVisits';

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

    // First, get the existing vet visit
    const getCommand = new GetCommand({
      TableName: TABLE_NAME,
      Key: {
        id: vetVisitId
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
          error: 'Vet visit not found'
        })
      };
    }

    const existingVetVisit = existingResult.Item as VetVisit;

    // Merge existing data with update data
    const updatedVetVisit: VetVisit = {
      ...existingVetVisit,
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

    // Save updated vet visit to DynamoDB
    await docClient.send(new PutCommand({
      TableName: TABLE_NAME,
      Item: updatedVetVisit
    }));

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
