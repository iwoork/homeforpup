import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { CognitoIdentityProviderClient, AdminUpdateUserAttributesCommand } from '@aws-sdk/client-cognito-identity-provider';
import { dynamodb, UpdateCommand } from '../../../shared/dynamodb';
import { successResponse, AuthenticatedEvent } from '../../../types/lambda';
import { wrapHandler, ApiError } from '../../../middleware/error-handler';
import { getUserIdFromEvent, requireAuth } from '../../../middleware/auth';

const cognito = new CognitoIdentityProviderClient({ region: process.env.AWS_REGION || 'us-east-1' });
const USER_POOL_ID = process.env.USER_POOL_ID!;

const PROFILES_TABLE = process.env.PROFILES_TABLE!;

async function handler(event: AuthenticatedEvent): Promise<APIGatewayProxyResult> {
  // Require authentication
  requireAuth(event);
  const currentUserId = getUserIdFromEvent(event);
  const targetUserId = event.pathParameters?.id;

  if (!targetUserId) {
    throw new ApiError('User ID is required', 400);
  }

  // Users can only update their own profile (unless admin)
  if (currentUserId !== targetUserId) {
    throw new ApiError('Forbidden: You can only update your own profile', 403);
  }

  if (!event.body) {
    throw new ApiError('Request body is required', 400);
  }

  try {
    const updates = JSON.parse(event.body);
    
    // Extract Cognito-only fields before removing them
    const cognitoFields: Record<string, string> = {};
    
    // Map of form field names to Cognito attribute names
    const cognitoFieldMapping: Record<string, string> = {
      firstName: 'given_name',
      lastName: 'family_name',
      phone: 'phone_number',
      location: 'address',
      profileImage: 'picture',
      bio: 'profile',  // Cognito's "profile" attribute
    };
    
    // Extract Cognito fields from updates
    Object.keys(cognitoFieldMapping).forEach(field => {
      if (updates[field] !== undefined) {
        cognitoFields[cognitoFieldMapping[field]] = updates[field];
      }
    });
    
    // Update Cognito user attributes if there are any Cognito-specific fields
    if (Object.keys(cognitoFields).length > 0) {
      console.log('Updating Cognito attributes:', Object.keys(cognitoFields));
      
      const userAttributes = Object.entries(cognitoFields).map(([name, value]) => ({
        Name: name,
        Value: String(value || ''),
      }));
      
      try {
        const cognitoCommand = new AdminUpdateUserAttributesCommand({
          UserPoolId: USER_POOL_ID,
          Username: targetUserId, // Cognito uses the userId (sub) as username
          UserAttributes: userAttributes,
        });
        
        await cognito.send(cognitoCommand);
        console.log('✅ Cognito attributes updated successfully');
      } catch (cognitoError) {
        console.error('Failed to update Cognito attributes:', cognitoError);
        // Don't throw - continue with profile update even if Cognito update fails
        // This allows partial success
      }
    }
    
    // Don't allow updating certain fields in the profiles table
    // These fields are either system-managed or stored in Cognito only
    const disallowedFields = [
      'userId',
      'email',
      'createdAt',
      'passwordHash',
      'refreshToken',
      // Cognito-only fields (managed above)
      'firstName',
      'lastName',
      'username',
      'phone',
      'location',
      'profileImage',
      'picture',
      'bio',
      'userType',
    ];
    disallowedFields.forEach(field => delete updates[field]);

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    Object.keys(updates).forEach((key, index) => {
      updateExpressions.push(`#field${index} = :value${index}`);
      expressionAttributeNames[`#field${index}`] = key;
      expressionAttributeValues[`:value${index}`] = updates[key];
    });

    // Add updatedAt
    updateExpressions.push(`#updatedAt = :updatedAt`);
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();
    
    // Add createdAt if profile doesn't exist (upsert behavior)
    updateExpressions.push(`#createdAt = if_not_exists(#createdAt, :createdAt)`);
    expressionAttributeNames['#createdAt'] = 'createdAt';
    expressionAttributeValues[':createdAt'] = new Date().toISOString();

    const updateCommand = new UpdateCommand({
      TableName: PROFILES_TABLE,
      Key: { userId: targetUserId },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    });

    const result = await dynamodb.send(updateCommand);

    // Remove sensitive fields
    const profile = { ...result.Attributes };
    delete profile.passwordHash;
    delete profile.refreshToken;

    return successResponse({
      profile,
    });
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    if (error instanceof SyntaxError) {
      throw new ApiError('Invalid JSON in request body', 400);
    }
    console.error('Error updating profile:', error);
    throw new ApiError('Failed to update profile', 500);
  }
}

export { handler };
export const wrappedHandler = wrapHandler(handler);

