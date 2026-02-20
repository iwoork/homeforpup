import { db, kennels, dogs, litters, eq, and, sql, inArray } from '@homeforpup/database';
import { getProfileByUserId } from './subscriptionDb';
import { SubscriptionTier, getTierLimits, isWithinLimit } from '@homeforpup/shared-types';

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

  // Count user's existing kennels using jsonb @> operator
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(kennels).where(
    sql`${kennels.owners}::jsonb @> ${JSON.stringify([userId])}::jsonb`
  );

  const currentCount = Number(result?.count) || 0;
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

  // Get user's kennel IDs
  const userKennels = await db.select({ id: kennels.id }).from(kennels).where(
    sql`${kennels.owners}::jsonb @> ${JSON.stringify([userId])}::jsonb`
  );

  const kennelIds = userKennels.map((k) => k.id);
  let currentCount = 0;

  if (kennelIds.length > 0) {
    // Count parent dogs in all user's kennels
    const [result] = await db.select({ count: sql<number>`count(*)` }).from(dogs).where(
      and(
        inArray(dogs.kennelId, kennelIds),
        eq(dogs.dogType, 'parent')
      )
    );
    currentCount = Number(result?.count) || 0;
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
  const [result] = await db.select({ count: sql<number>`count(*)` }).from(litters).where(
    and(
      sql`${litters.breederId} = ${userId}`,
      inArray(litters.status, ['planned', 'expecting', 'born', 'weaning'])
    )
  );

  const currentCount = Number(result?.count) || 0;
  const allowed = isWithinLimit(currentCount, limits.maxActiveLitters);

  return {
    allowed,
    reason: allowed ? undefined : `Your ${tier} plan allows up to ${limits.maxActiveLitters} active litter(s). Upgrade to add more.`,
    currentCount,
    limit: limits.maxActiveLitters,
    tier,
  };
}
