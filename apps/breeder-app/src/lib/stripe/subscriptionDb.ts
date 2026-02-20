import { db, profiles, eq, sql } from '@homeforpup/database';
import { SubscriptionTier } from '@homeforpup/shared-types';

export async function getProfileByUserId(userId: string) {
  const [result] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
  return result || null;
}

export async function getProfileByStripeCustomerId(stripeCustomerId: string) {
  const [result] = await db.select().from(profiles).where(eq(profiles.stripeCustomerId, stripeCustomerId)).limit(1);
  return result || null;
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

  const updateData: Record<string, any> = {
    updatedAt: new Date().toISOString(),
  };

  if (updates.subscriptionPlan !== undefined) updateData.subscriptionPlan = updates.subscriptionPlan;
  if (updates.subscriptionStatus !== undefined) updateData.subscriptionStatus = updates.subscriptionStatus;
  if (updates.stripeCustomerId !== undefined) updateData.stripeCustomerId = updates.stripeCustomerId;
  if (updates.stripeSubscriptionId !== undefined) updateData.stripeSubscriptionId = updates.stripeSubscriptionId;
  if (updates.isPremium !== undefined) updateData.isPremium = updates.isPremium;
  if (updates.subscriptionStartDate !== undefined) updateData.subscriptionStartDate = updates.subscriptionStartDate;
  if (updates.subscriptionEndDate !== undefined) updateData.subscriptionEndDate = updates.subscriptionEndDate;

  const [updatedProfile] = await db.update(profiles).set(updateData).where(eq(profiles.userId, userId)).returning();

  return updatedProfile;
}
