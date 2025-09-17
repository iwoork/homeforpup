import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, ScanCommand, QueryCommand } from '@aws-sdk/lib-dynamodb';
import { Breeder, Litter, Dog } from '@/types';

// Create DynamoDB client with proper error handling
const createDynamoDBClient = () => {
  const config: any = {
    region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  };

  // Only add credentials if they exist
  if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
    config.credentials = {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    };
  }

  return new DynamoDBClient(config);
};

const client = createDynamoDBClient();
export const dynamodb = DynamoDBDocumentClient.from(client);

// Table names
const TABLES = {
  BREEDERS: 'homeforpup-breeders',
  DOGS: 'homeforpup-dogs',
  LITTERS: 'homeforpup-litters',
};

// Helper functions for database operations with better error handling
export const dbOperations = {
  // Breeder operations
  async createBreeder(breeder: Omit<Breeder, 'id'> & { id?: string }) {
    try {
      const command = new PutCommand({
        TableName: TABLES.BREEDERS,
        Item: breeder,
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error creating breeder:', error);
      throw new Error(`Failed to create breeder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getBreeder(breederId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.BREEDERS,
        Key: { id: breederId },
      });
      const result = await dynamodb.send(command);
      return result;
    } catch (error) {
      console.error('Error getting breeder:', error);
      
      if (error instanceof Error && error.message.includes('not authorized')) {
        throw new Error('Database access denied. Please check your AWS permissions.');
      }
      
      throw new Error(`Failed to get breeder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async updateBreeder(breederId: string, updates: Partial<Breeder>) {
    try {
      const command = new UpdateCommand({
        TableName: TABLES.BREEDERS,
        Key: { id: breederId },
        UpdateExpression: 'SET #name = :name, #email = :email, #phone = :phone, #location = :location, #description = :description, #website = :website, #updatedAt = :updatedAt',
        ExpressionAttributeNames: {
          '#name': 'name',
          '#email': 'email',
          '#phone': 'phone',
          '#location': 'location',
          '#description': 'description',
          '#website': 'website',
        },
        ExpressionAttributeValues: {
          ':name': updates.name,
          ':email': updates.email,
          ':phone': updates.phone,
          ':location': updates.location,
          ':description': updates.description,
          ':website': updates.website,
          ':updatedAt': new Date().toISOString(),
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error updating breeder:', error);
      throw new Error(`Failed to update breeder: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Dog operations (consolidated parent dogs and puppies)
  async createDog(dog: Omit<Dog, 'id'> & { id?: string }) {
    try {
      const command = new PutCommand({
        TableName: TABLES.DOGS,
        Item: dog,
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error creating dog:', error);
      throw new Error(`Failed to create dog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getDog(dogId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.DOGS,
        Key: { id: dogId },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting dog:', error);
      throw new Error(`Failed to get dog: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getDogsByBreeder(breederId: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.DOGS,
        IndexName: 'BreederIndex',
        KeyConditionExpression: 'breederId = :breederId',
        ExpressionAttributeValues: {
          ':breederId': breederId,
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting dogs by breeder:', error);
      throw new Error(`Failed to get dogs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getBreedingDogs(breederId: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.DOGS,
        IndexName: 'BreederIndex',
        KeyConditionExpression: 'breederId = :breederId',
        FilterExpression: 'breedingStatus = :status AND litterId = :litterId',
        ExpressionAttributeValues: {
          ':breederId': breederId,
          ':status': 'available',
          ':litterId': null,
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting breeding dogs:', error);
      throw new Error(`Failed to get breeding dogs: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getPuppiesByLitter(litterId: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.DOGS,
        IndexName: 'LitterIndex',
        KeyConditionExpression: 'litterId = :litterId',
        ExpressionAttributeValues: {
          ':litterId': litterId,
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting puppies by litter:', error);
      throw new Error(`Failed to get puppies: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  // Litter operations
  async createLitter(litter: Omit<Litter, 'id'> & { id?: string }) {
    try {
      const command = new PutCommand({
        TableName: TABLES.LITTERS,
        Item: litter,
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error creating litter:', error);
      throw new Error(`Failed to create litter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getLitter(litterId: string) {
    try {
      const command = new GetCommand({
        TableName: TABLES.LITTERS,
        Key: { id: litterId },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting litter:', error);
      throw new Error(`Failed to get litter: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getLittersByBreeder(breederId: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.LITTERS,
        IndexName: 'BreederIndex',
        KeyConditionExpression: 'breederId = :breederId',
        ExpressionAttributeValues: {
          ':breederId': breederId,
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting litters by breeder:', error);
      throw new Error(`Failed to get litters: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getLittersBySeason(breederId: string, season: string) {
    try {
      const command = new QueryCommand({
        TableName: TABLES.LITTERS,
        IndexName: 'BreederIndex',
        KeyConditionExpression: 'breederId = :breederId',
        FilterExpression: 'season = :season',
        ExpressionAttributeValues: {
          ':breederId': breederId,
          ':season': season,
        },
      });
      return await dynamodb.send(command);
    } catch (error) {
      console.error('Error getting litters by season:', error);
      throw new Error(`Failed to get litters by season: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  async getLittersByParent(parentId: string) {
    try {
      // Query for litters where this dog is either sire or dam
      const [sireResult, damResult] = await Promise.all([
        dynamodb.send(new QueryCommand({
          TableName: TABLES.LITTERS,
          IndexName: 'SireIndex',
          KeyConditionExpression: 'sireId = :sireId',
          ExpressionAttributeValues: { ':sireId': parentId },
        })),
        dynamodb.send(new QueryCommand({
          TableName: TABLES.LITTERS,
          IndexName: 'DamIndex', 
          KeyConditionExpression: 'damId = :damId',
          ExpressionAttributeValues: { ':damId': parentId },
        })),
      ]);

      // Combine results
      const allLitters = [
        ...(sireResult.Items || []),
        ...(damResult.Items || []),
      ];

      return { Items: allLitters, Count: allLitters.length };
    } catch (error) {
      console.error('Error getting litters by parent:', error);
      throw new Error(`Failed to get litters by parent: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },
};