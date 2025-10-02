import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const dynamoClient = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

const docClient = DynamoDBDocumentClient.from(dynamoClient);
const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';

export interface KennelAccessResult {
  hasAccess: boolean;
  accessType: 'owner' | 'direct' | 'kennel_owner' | 'kennel_manager' | 'none';
  kennelId?: string;
  kennelName?: string;
}

/**
 * Check if a user has access to a dog through direct ownership or kennel ownership
 */
export async function checkDogAccess(
  userId: string, 
  dog: { id: string; ownerId: string; kennelId?: string; name: string }
): Promise<KennelAccessResult> {
  // Direct ownership check
  if (dog.ownerId === userId) {
    return {
      hasAccess: true,
      accessType: 'direct',
    };
  }

  // If dog has no kennel, and user doesn't own it directly, no access
  if (!dog.kennelId) {
    return {
      hasAccess: false,
      accessType: 'none',
    };
  }

  // Check kennel ownership
  try {
    const kennelCommand = new GetCommand({
      TableName: KENNELS_TABLE,
      Key: { id: dog.kennelId },
    });

    const kennelResult = await docClient.send(kennelCommand);
    if (!kennelResult.Item) {
      console.log(`Kennel ${dog.kennelId} not found for dog ${dog.id}`);
      return {
        hasAccess: false,
        accessType: 'none',
      };
    }

    const kennel = kennelResult.Item as any;
    
    // Check if user is kennel owner
    if (kennel.owners && kennel.owners.includes(userId)) {
      return {
        hasAccess: true,
        accessType: 'kennel_owner',
        kennelId: dog.kennelId,
        kennelName: kennel.name,
      };
    }

    // Check if user is kennel manager
    if (kennel.managers && kennel.managers.includes(userId)) {
      return {
        hasAccess: true,
        accessType: 'kennel_manager',
        kennelId: dog.kennelId,
        kennelName: kennel.name,
      };
    }

    return {
      hasAccess: false,
      accessType: 'none',
      kennelId: dog.kennelId,
      kennelName: kennel.name,
    };
  } catch (error) {
    console.error('Error checking kennel access:', error);
    return {
      hasAccess: false,
      accessType: 'none',
    };
  }
}

/**
 * Get all kennel IDs that a user has access to (as owner or manager)
 */
export async function getUserKennelIds(userId: string): Promise<string[]> {
  try {
    console.log('Getting kennel IDs for user:', userId);
    
    const scanCommand = new ScanCommand({
      TableName: KENNELS_TABLE,
      FilterExpression: 'contains(owners, :userId) OR contains(managers, :userId)',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
    });

    const result = await docClient.send(scanCommand);
    const kennels = (result.Items || []) as any[];
    const kennelIds = kennels.map(kennel => kennel.id);
    
    console.log(`Found ${kennelIds.length} accessible kennels for user ${userId}:`, kennelIds);
    return kennelIds;
  } catch (error) {
    console.error('Error getting user kennel IDs:', error);
    return [];
  }
}

/**
 * Get all dogs that a user has access to (direct ownership + kennel-based access)
 */
export async function getUserAccessibleDogs(userId: string, options: any = {}): Promise<{ dogs: any[]; total: number }> {
  try {
    console.log('Getting accessible dogs for user:', userId);
    
    // Get user's accessible kennel IDs
    const kennelIds = await getUserKennelIds(userId);
    
    // Build filter expression for dogs
    const filterExpressions: string[] = [];
    const expressionAttributeValues: Record<string, any> = {};
    
    // Include dogs owned directly by the user OR in user's kennels
    if (kennelIds.length > 0) {
      const kennelFilters = kennelIds.map((_, index) => `kennelId = :kennelId${index}`);
      filterExpressions.push(`(ownerId = :userId OR ${kennelFilters.join(' OR ')})`);
      expressionAttributeValues[':userId'] = userId;
      kennelIds.forEach((kennelId, index) => {
        expressionAttributeValues[`:kennelId${index}`] = kennelId;
      });
    } else {
      // If no kennels, just filter by direct ownership
      filterExpressions.push('ownerId = :userId');
      expressionAttributeValues[':userId'] = userId;
    }
    
    // Add other filters from options
    const expressionAttributeNames: Record<string, string> = {};
    
    if (options.search) {
      filterExpressions.push('(contains(#name, :search) OR contains(callName, :search) OR contains(breed, :search))');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = options.search;
    }
    
    if (options.type) {
      filterExpressions.push('#dogType = :dogType');
      expressionAttributeNames['#dogType'] = 'dogType';
      expressionAttributeValues[':dogType'] = options.type;
    }
    
    if (options.gender) {
      filterExpressions.push('gender = :gender');
      expressionAttributeValues[':gender'] = options.gender;
    }
    
    if (options.breed) {
      filterExpressions.push('breed = :breed');
      expressionAttributeValues[':breed'] = options.breed;
    }
    
    if (options.breedingStatus) {
      filterExpressions.push('breedingStatus = :breedingStatus');
      expressionAttributeValues[':breedingStatus'] = options.breedingStatus;
    }
    
    const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
    
    const scanCommand = new ScanCommand({
      TableName: DOGS_TABLE,
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeNames: Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined,
      ExpressionAttributeValues: expressionAttributeValues,
    });
    
    console.log('Scanning dogs with filter:', {
      FilterExpression: filterExpressions.join(' AND '),
      ExpressionAttributeValues: expressionAttributeValues
    });
    
    const result = await docClient.send(scanCommand);
    const dogs = (result.Items || []) as any[];
    
    console.log(`Found ${dogs.length} accessible dogs for user ${userId}`);
    
    // Apply sorting
    const sortBy = options.sortBy || 'updatedAt';
    const sortedDogs = [...dogs];
    switch (sortBy) {
      case 'name':
        sortedDogs.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'breed':
        sortedDogs.sort((a, b) => a.breed.localeCompare(b.breed) || a.name.localeCompare(b.name));
        break;
      case 'birthDate':
        sortedDogs.sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime());
        break;
      case 'updatedAt':
      default:
        sortedDogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }
    
    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = options.offset || (page - 1) * limit;
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedDogs = sortedDogs.slice(startIndex, endIndex);
    
    console.log(`Returning ${paginatedDogs.length} dogs (page ${page}, limit ${limit})`);
    
    return {
      dogs: paginatedDogs,
      total: sortedDogs.length
    };
  } catch (error) {
    console.error('Error getting user accessible dogs:', error);
    return { dogs: [], total: 0 };
  }
}
