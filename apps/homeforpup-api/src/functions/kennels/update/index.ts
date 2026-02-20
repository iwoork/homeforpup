import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { getDb, kennels, eq } from '../../../shared/dynamodb';
import { successResponse, errorResponse } from '../../../types/lambda';
import { wrapHandler } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  let userId: string;
  try {
    userId = getUserIdFromEvent(event as any);
    if (!userId) {
      return errorResponse('Unauthorized', 401);
    }
  } catch (error: any) {
    return errorResponse(error.message || 'Unauthorized', 401);
  }

  // Check if user is a breeder
  const userType = (event as any).requestContext.authorizer?.userType;
  if (userType !== 'breeder') {
    return errorResponse('Forbidden: Only breeders can update kennels', 403);
  }

  const kennelId = event.pathParameters?.id;

  if (!kennelId) {
    return errorResponse('Kennel ID is required', 400);
  }

  if (!event.body) {
    return errorResponse('Request body is required', 400);
  }

  try {
    const db = getDb();

    // Get existing kennel
    const [existingKennel] = await db.select().from(kennels).where(eq(kennels.id, kennelId)).limit(1);

    if (!existingKennel) {
      return errorResponse('Kennel not found', 404);
    }

    // Log kennel ownership for debugging
    console.log('Checking kennel ownership:', {
      userId,
      kennelId,
      owners: existingKennel.owners,
      ownerId: existingKennel.ownerId,
      createdBy: existingKennel.createdBy,
      managers: existingKennel.managers,
    });

    // Check if user is owner or manager - check multiple ownership fields for backward compatibility
    // Handle both array and string cases for owners/managers
    const ownersArray = Array.isArray(existingKennel.owners)
      ? existingKennel.owners
      : (existingKennel.owners ? [existingKennel.owners] : []);
    const managersArray = Array.isArray(existingKennel.managers)
      ? existingKennel.managers
      : (existingKennel.managers ? [existingKennel.managers] : []);

    const isOwner =
      (ownersArray as string[]).includes(userId) ||
      existingKennel.ownerId === userId ||
      existingKennel.createdBy === userId;
    const isManager = (managersArray as string[]).includes(userId);

    console.log('Authorization check:', { isOwner, isManager });

    if (!isOwner && !isManager) {
      return errorResponse('Forbidden: You do not have permission to update this kennel', 403);
    }

    const body = JSON.parse(event.body);

    // Update kennel (merge with existing data)
    const updatedKennel = {
      ...existingKennel,
      ...body,
      id: kennelId, // Ensure ID doesn't change
      owners: existingKennel.owners, // Preserve owners
      createdBy: existingKennel.createdBy, // Preserve creator
      createdAt: existingKennel.createdAt, // Preserve creation date
      updatedAt: new Date().toISOString(),
    };

    // Use insert with full replacement (like original PutCommand behavior)
    await db.update(kennels).set(updatedKennel).where(eq(kennels.id, kennelId));

    return successResponse({ kennel: updatedKennel });
  } catch (error) {
    console.error('Error updating kennel:', error);
    return errorResponse('Failed to update kennel', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);
