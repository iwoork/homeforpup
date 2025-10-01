import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';

// DynamoDB client configuration
export const createDynamoClient = () => {
  return new DynamoDBClient({
    region: process.env.NEXT_PUBLIC_AWS_REGION,
    credentials: {
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
  });
};

export const createDocClient = () => {
  return DynamoDBDocumentClient.from(createDynamoClient(), {
    marshallOptions: {
      removeUndefinedValues: true,
    },
  });
};

// Table names
export const getTableNames = () => ({
  DOGS_TABLE: process.env.DOGS_TABLE_NAME || 'homeforpup-dogs',
  KENNELS_TABLE: process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels',
});
