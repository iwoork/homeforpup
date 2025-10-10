import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand, GetCommand, PutCommand, UpdateCommand, DeleteCommand } from '@aws-sdk/lib-dynamodb';
import { Dog, DogsResponse, UseDogsOptions, CreateDogRequest, UpdateDogRequest, MatchedDogsResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK v3
const createDynamoClient = () => {
  const client = new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
    },
  });

  return DynamoDBDocumentClient.from(client, {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

export class DogsApiClient {
  private dynamodb: DynamoDBDocumentClient;

  constructor() {
    this.dynamodb = createDynamoClient();
  }

  async getDogs(options: UseDogsOptions = {}, userId?: string): Promise<DogsResponse> {
    const {
      search = '',
      kennelId = '',
      type = '',
      gender = '',
      breed = '',
      status = '',
      breedingStatus = '',
      page = 1,
      limit = 20,
      offset = 0,
      sortBy = 'updatedAt',
      ownerId
    } = options;

    console.log('API Request params:', { search, kennelId, type, gender, breed, status, breedingStatus, page, limit, offset, sortBy, userId, ownerId });

    // Build DynamoDB query parameters
    const params: any = {
      TableName: DOGS_TABLE,
    };

    const filterExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Filter by user's dogs (for breeder app) or specific owner
    if (userId) {
      filterExpressions.push('ownerId = :userId');
      expressionAttributeValues[':userId'] = userId;
    } else if (ownerId) {
      filterExpressions.push('ownerId = :ownerId');
      expressionAttributeValues[':ownerId'] = ownerId;
    }

    // Search filter
    if (search) {
      filterExpressions.push('(contains(#name, :search) OR contains(callName, :search) OR contains(breed, :search))');
      expressionAttributeNames['#name'] = 'name';
      expressionAttributeValues[':search'] = search;
    }

    // Kennel filter
    if (kennelId) {
      filterExpressions.push('kennelId = :kennelId');
      expressionAttributeValues[':kennelId'] = kennelId;
    }

    // Type filter
    if (type) {
      filterExpressions.push('#dogType = :dogType');
      expressionAttributeNames['#dogType'] = 'dogType';
      expressionAttributeValues[':dogType'] = type;
    }

    // Gender filter
    if (gender) {
      filterExpressions.push('gender = :gender');
      expressionAttributeValues[':gender'] = gender;
    }

    // Breed filter
    if (breed) {
      filterExpressions.push('breed = :breed');
      expressionAttributeValues[':breed'] = breed;
    }

    // Status filter
    if (status) {
      filterExpressions.push('#status = :status');
      expressionAttributeNames['#status'] = 'status';
      expressionAttributeValues[':status'] = status;
    }

    // Breeding status filter
    if (breedingStatus) {
      filterExpressions.push('breedingStatus = :breedingStatus');
      expressionAttributeValues[':breedingStatus'] = breedingStatus;
    }

    // Apply filters
    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeNames = Object.keys(expressionAttributeNames).length > 0 ? expressionAttributeNames : undefined;
      params.ExpressionAttributeValues = Object.keys(expressionAttributeValues).length > 0 ? expressionAttributeValues : undefined;
    }

    console.log('DynamoDB params:', JSON.stringify(params, null, 2));

    // Execute scan
    const result = await this.dynamodb.send(new ScanCommand(params));
    const dogs = (result.Items as Dog[]) || [];

    console.log(`Found ${dogs.length} dogs in DynamoDB`);

    // Apply sorting
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
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDogs = sortedDogs.slice(startIndex, endIndex);
    const totalCount = sortedDogs.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const hasMore = totalCount > endIndex;

    console.log(`Returning ${paginatedDogs.length} dogs for page ${page} of ${totalPages}`);

    return {
      dogs: paginatedDogs,
      total: totalCount,
      count: paginatedDogs.length,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      hasMore
    };
  }

  async getDogById(id: string): Promise<Dog | null> {
    const params = {
      TableName: DOGS_TABLE,
      Key: { id }
    };

    const result = await this.dynamodb.send(new GetCommand(params));
    return (result.Item as Dog) || null;
  }

  async createDog(dogData: CreateDogRequest, userId: string): Promise<Dog> {
    const now = new Date().toISOString();
    const dog: Dog = {
      id: uuidv4(),
      ownerId: userId,
      ...dogData,
      weight: dogData.weight || 0,
      description: dogData.description || '',
      dogType: dogData.dogType || 'puppy',
      healthTests: [],
      breedingStatus: dogData.breedingStatus || 'not_ready',
      healthStatus: dogData.healthStatus || 'good',
      createdAt: now,
      updatedAt: now
    };

    const params = {
      TableName: DOGS_TABLE,
      Item: dog
    };

    await this.dynamodb.send(new PutCommand(params));
    return dog;
  }

  async updateDog(dogData: UpdateDogRequest): Promise<Dog> {
    const now = new Date().toISOString();
    
    // First get the existing dog
    const existing = await this.getDogById(dogData.id);
    if (!existing) {
      throw new Error('Dog not found');
    }

    // Build update expression
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    // Add fields to update
    const fieldsToUpdate = [
      'name', 'callName', 'breed', 'gender', 'birthDate', 'weight', 'color', 
      'kennelId', 'description', 'dogType', 'breedingStatus', 
      'healthStatus', 'sireId', 'damId', 'photoUrl', 
      'registrationNumber', 'microchipNumber', 'notes'
    ];

    fieldsToUpdate.forEach(field => {
      if (dogData[field as keyof UpdateDogRequest] !== undefined) {
        updateExpressions.push(`#${field} = :${field}`);
        expressionAttributeNames[`#${field}`] = field;
        expressionAttributeValues[`:${field}`] = dogData[field as keyof UpdateDogRequest];
        
      }
    });

    // Always update the updatedAt field
    updateExpressions.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = now;

    const params = {
      TableName: DOGS_TABLE,
      Key: { id: dogData.id },
      UpdateExpression: `SET ${updateExpressions.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW' as const
    };

    const result = await this.dynamodb.send(new UpdateCommand(params));
    return result.Attributes as Dog;
  }

  async deleteDog(id: string): Promise<void> {
    const params = {
      TableName: DOGS_TABLE,
      Key: { id }
    };

    await this.dynamodb.send(new DeleteCommand(params));
  }

  async getMatchedDogs(userId: string): Promise<MatchedDogsResponse> {
    // First get user's preferences
    const userParams = {
      TableName: USERS_TABLE,
      Key: { userId }
    };

    const userResult = await this.dynamodb.send(new GetCommand(userParams));
    
    if (!userResult.Item) {
      return { matchedPuppies: [] };
    }

    const user = userResult.Item;
    const userCriteria = user.puppyParentInfo || user.dogParentInfo || {};

    // If user hasn't set any criteria, return empty array
    if (!userCriteria.preferredBreeds || userCriteria.preferredBreeds.length === 0) {
      return { matchedPuppies: [] };
    }

    // Get all available dogs
    const dogsParams = {
      TableName: DOGS_TABLE,
      FilterExpression: 'breedingStatus = :status',
      ExpressionAttributeValues: {
        ':status': 'available'
      }
    };

    const dogsResult = await this.dynamodb.send(new ScanCommand(dogsParams));

    if (!dogsResult.Items) {
      return { matchedPuppies: [] };
    }

    // Filter dogs based on user criteria
    const matchedPuppies = dogsResult.Items.filter((dog: any) => {
      // Check if breed matches user preferences
      if (userCriteria.preferredBreeds && !userCriteria.preferredBreeds.includes(dog.breed)) {
        return false;
      }

      // Add more matching criteria as needed
      return true;
    }) as Dog[];

    // Sort by most recent first
    matchedPuppies.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { matchedPuppies, total: matchedPuppies.length };
  }
}

// Create a singleton instance
export const dogsApiClient = new DogsApiClient();
