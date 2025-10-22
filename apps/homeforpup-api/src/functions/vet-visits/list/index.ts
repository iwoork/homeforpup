import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { VetVisit } from '../../../../packages/shared-types/src';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.VET_VISITS_TABLE || 'VetVisits';

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

    let vetVisits: VetVisit[] = [];

    if (dogId) {
      // Query by dogId (if using GSI)
      const queryCommand = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'DogIdIndex', // Assuming we have a GSI on dogId
        KeyConditionExpression: 'dogId = :dogId',
        ExpressionAttributeValues: {
          ':dogId': dogId
        },
        ScanIndexForward: false, // Sort by visit date descending
        Limit: limit
      });

      const result = await docClient.send(queryCommand);
      vetVisits = (result.Items as VetVisit[]) || [];
    } else if (ownerId) {
      // Query by ownerId (if using GSI)
      const queryCommand = new QueryCommand({
        TableName: TABLE_NAME,
        IndexName: 'OwnerIdIndex', // Assuming we have a GSI on ownerId
        KeyConditionExpression: 'ownerId = :ownerId',
        ExpressionAttributeValues: {
          ':ownerId': ownerId
        },
        ScanIndexForward: false, // Sort by visit date descending
        Limit: limit
      });

      const result = await docClient.send(queryCommand);
      vetVisits = (result.Items as VetVisit[]) || [];
    } else {
      // Scan all vet visits (for admin purposes)
      const scanCommand = new ScanCommand({
        TableName: TABLE_NAME,
        Limit: limit
      });

      const result = await docClient.send(scanCommand);
      vetVisits = (result.Items as VetVisit[]) || [];
    }

    // Apply additional filters
    if (visitType) {
      vetVisits = vetVisits.filter(visit => visit.visitType === visitType);
    }

    if (status) {
      vetVisits = vetVisits.filter(visit => visit.status === status);
    }

    // Sort by visit date (most recent first)
    vetVisits.sort((a, b) => new Date(b.visitDate).getTime() - new Date(a.visitDate).getTime());

    // Calculate pagination
    const total = vetVisits.length;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVisits = vetVisits.slice(startIndex, endIndex);

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
