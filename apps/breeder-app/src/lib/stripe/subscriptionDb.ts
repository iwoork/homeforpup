import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { SubscriptionTier } from '@homeforpup/shared-types';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const USERS_TABLE = process.env.USERS_TABLE_NAME || 'homeforpup-users';

export async function getProfileByUserId(userId: string) {
  const result = await dynamodb.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { userId },
  }));
  return result.Item || null;
}

export async function getProfileByStripeCustomerId(stripeCustomerId: string) {
  const result = await dynamodb.send(new ScanCommand({
    TableName: USERS_TABLE,
    FilterExpression: 'stripeCustomerId = :cid',
    ExpressionAttributeValues: { ':cid': stripeCustomerId },
    Limit: 1,
  }));
  return result.Items?.[0] || null;
}

export async function updateSubscription(
  userId: string,
  updates: {
    subscriptionPlan?: SubscriptionTier;
    subscriptionStatus?: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    isPremium?: boolean;
    subscriptionStartDate?: string;
    subscriptionEndDate?: string;
  }
) {
  const existing = await getProfileByUserId(userId);
  if (!existing) {
    throw new Error(`Profile not found for userId: ${userId}`);
  }

  const updatedProfile = {
    ...existing,
    ...updates,
    updatedAt: new Date().toISOString(),
  };

  await dynamodb.send(new PutCommand({
    TableName: USERS_TABLE,
    Item: updatedProfile,
  }));

  return updatedProfile;
}
