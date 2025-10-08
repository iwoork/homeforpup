import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { dynamodb, ScanCommand } from '../../../shared/dynamodb';
import { successResponse } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';

const BREEDS_TABLE = process.env.BREEDS_TABLE!;

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  const queryParams = event.queryStringParameters || {};
  const {
    search,
    category,
    size,
    breedType,
    page = '1',
    limit = '50',
    sortBy = 'name',
  } = queryParams;

  try {
    // Scan all breeds (in production, use better indexing)
    const command = new ScanCommand({
      TableName: BREEDS_TABLE,
    });

    const result = await dynamodb.send(command);
    let items = result.Items || [];

    // Apply filters
    if (search) {
      const searchLower = search.toLowerCase();
      items = items.filter((item: any) =>
        item.name?.toLowerCase().includes(searchLower)
      );
    }

    if (category && category !== 'All') {
      items = items.filter((item: any) => item.category === category);
    }

    if (size && size !== 'All') {
      items = items.filter((item: any) => item.size === size);
    }

    if (breedType && breedType !== 'All') {
      items = items.filter((item: any) => item.breedType === breedType);
    }

    // Sort
    items.sort((a: any, b: any) => {
      const aVal = a[sortBy] || '';
      const bVal = b[sortBy] || '';
      return aVal.toString().localeCompare(bVal.toString());
    });

    // Pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const paginatedItems = items.slice(startIndex, endIndex);

    return successResponse({
      breeds: paginatedItems,
      page: pageNum,
      limit: limitNum,
      total: items.length,
      totalPages: Math.ceil(items.length / limitNum),
      hasNextPage: endIndex < items.length,
      hasPrevPage: pageNum > 1,
    });
  } catch (error) {
    console.error('Error listing breeds:', error);
    throw new ApiError('Failed to list breeds', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

