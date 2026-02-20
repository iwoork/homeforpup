import { APIGatewayProxyResult } from 'aws-lambda';
import { getDb, litters } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';
import { v4 as uuidv4 } from 'uuid';

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const breederId = getUserIdFromEvent(event);

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const litterData = JSON.parse(event.body);

    // Validate required fields
    if (!litterData.breed || !litterData.sireId || !litterData.damId || !litterData.breedingDate || !litterData.expectedDate) {
      throw new ApiError('Missing required fields: breed, sireId, damId, breedingDate, expectedDate', 400);
    }

    // Create litter object
    const litter = {
      id: uuidv4(),
      breederId,
      breed: litterData.breed,
      sireId: litterData.sireId,
      damId: litterData.damId,
      breedingDate: litterData.breedingDate,
      expectedDate: litterData.expectedDate,
      birthDate: litterData.birthDate || undefined,
      season: litterData.season || 'spring',
      description: litterData.description || '',
      puppyCount: litterData.puppyCount || 0,
      maleCount: litterData.maleCount || 0,
      femaleCount: litterData.femaleCount || 0,
      availablePuppies: litterData.availablePuppies || 0,
      status: litterData.status || 'planned',
      priceRange: litterData.priceRange || undefined,
      photos: litterData.photos || [],
      healthClearances: litterData.healthClearances || [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const db = getDb();

    // Save to database
    await db.insert(litters).values(litter);

    return successResponse({ litter }, 201);
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error creating litter:', error);
    throw new ApiError('Failed to create litter', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
