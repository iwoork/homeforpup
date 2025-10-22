import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, QueryCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { Veterinarian } from '../../../../packages/shared-types/src';
import { getUserIdFromEvent } from '../../../middleware/auth';

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const TABLE_NAME = process.env.VETERINARIANS_TABLE || 'Veterinarians';

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

    // Query veterinarians for the authenticated user
    const queryCommand = new QueryCommand({
      TableName: TABLE_NAME,
      IndexName: 'OwnerIdIndex', // Assuming we have a GSI on ownerId
      KeyConditionExpression: 'ownerId = :ownerId',
      ExpressionAttributeValues: {
        ':ownerId': userId
      },
      ScanIndexForward: false, // Sort by creation date descending
      Limit: limit
    });

    const result = await docClient.send(queryCommand);
    let veterinarians = (result.Items as Veterinarian[]) || [];

    // Apply additional filters
    if (isActive !== undefined) {
      const activeFilter = isActive === 'true';
      veterinarians = veterinarians.filter(vet => vet.isActive === activeFilter);
    }

    // Sort by name
    veterinarians.sort((a, b) => a.name.localeCompare(b.name));

    // Calculate pagination
    const total = veterinarians.length;
    const totalPages = Math.ceil(total / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    // Apply pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedVeterinarians = veterinarians.slice(startIndex, endIndex);

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
