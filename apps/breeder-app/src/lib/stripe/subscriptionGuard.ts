import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb';
import { getProfileByUserId } from './subscriptionDb';
import { SubscriptionTier, getTierLimits, isWithinLimit } from '@homeforpup/shared-types';

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

const KENNELS_TABLE = process.env.KENNELS_TABLE_NAME || 'homeforpup-kennels';
const DOGS_TABLE = process.env.DOGS_TABLE_NAME || 'homeforpup-dogs';
const LITTERS_TABLE = process.env.LITTERS_TABLE_NAME || 'homeforpup-litters';

interface GuardResult {
  allowed: boolean;
  reason?: string;
  currentCount: number;
  limit: number;
  tier: SubscriptionTier;
}

export async function checkKennelCreationAllowed(userId: string): Promise<GuardResult> {
  const profile = await getProfileByUserId(userId);
  const tier: SubscriptionTier = (profile?.subscriptionPlan as SubscriptionTier) || 'free';
  const limits = getTierLimits(tier);

  // Count user's existing kennels
  const result = await dynamodb.send(new ScanCommand({
    TableName: KENNELS_TABLE,
    FilterExpression: 'contains(owners, :userId)',
    ExpressionAttributeValues: { ':userId': userId },
    Select: 'COUNT',
  }));

  const currentCount = result.Count || 0;
  const allowed = isWithinLimit(currentCount, limits.maxKennels);

  return {
    allowed,
    reason: allowed ? undefined : `Your ${tier} plan allows up to ${limits.maxKennels} kennel(s). Upgrade to add more.`,
    currentCount,
    limit: limits.maxKennels,
    tier,
  };
}

export async function checkDogCreationAllowed(userId: string): Promise<GuardResult> {
  const profile = await getProfileByUserId(userId);
  const tier: SubscriptionTier = (profile?.subscriptionPlan as SubscriptionTier) || 'free';
  const limits = getTierLimits(tier);

  // Count user's existing parent dogs across all kennels
  const kennelsResult = await dynamodb.send(new ScanCommand({
    TableName: KENNELS_TABLE,
    FilterExpression: 'contains(owners, :userId)',
    ExpressionAttributeValues: { ':userId': userId },
  }));

  const kennelIds = (kennelsResult.Items || []).map((k: any) => k.id);
  let currentCount = 0;

  if (kennelIds.length > 0) {
    // Count dogs in all user's kennels (parent dogs only)
    for (const kennelId of kennelIds) {
      const dogsResult = await dynamodb.send(new ScanCommand({
        TableName: DOGS_TABLE,
        FilterExpression: 'kennelId = :kennelId AND dogType = :parentType',
        ExpressionAttributeValues: { ':kennelId': kennelId, ':parentType': 'parent' },
        Select: 'COUNT',
      }));
      currentCount += dogsResult.Count || 0;
    }
  }

  const allowed = isWithinLimit(currentCount, limits.maxParentDogs);

  return {
    allowed,
    reason: allowed ? undefined : `Your ${tier} plan allows up to ${limits.maxParentDogs} parent dog(s). Upgrade to add more.`,
    currentCount,
    limit: limits.maxParentDogs,
    tier,
  };
}

export async function checkLitterCreationAllowed(userId: string): Promise<GuardResult> {
  const profile = await getProfileByUserId(userId);
  const tier: SubscriptionTier = (profile?.subscriptionPlan as SubscriptionTier) || 'free';
  const limits = getTierLimits(tier);

  // Count user's active litters
  const result = await dynamodb.send(new ScanCommand({
    TableName: LITTERS_TABLE,
    FilterExpression: 'contains(kennelOwners, :userId) AND #s IN (:s1, :s2, :s3, :s4)',
    ExpressionAttributeNames: { '#s': 'status' },
    ExpressionAttributeValues: {
      ':userId': userId,
      ':s1': 'planned',
      ':s2': 'expecting',
      ':s3': 'born',
      ':s4': 'weaning',
    },
    Select: 'COUNT',
  }));

  const currentCount = result.Count || 0;
  const allowed = isWithinLimit(currentCount, limits.maxActiveLitters);

  return {
    allowed,
    reason: allowed ? undefined : `Your ${tier} plan allows up to ${limits.maxActiveLitters} active litter(s). Upgrade to add more.`,
    currentCount,
    limit: limits.maxActiveLitters,
    tier,
  };
}
