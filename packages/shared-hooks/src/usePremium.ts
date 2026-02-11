/**
 * Hook to check if a user has premium access
 * Premium users can see verified badges for dog parents and breeders
 */

import { User } from '@homeforpup/shared-types';
import { SubscriptionTier, TierLimits, getTierLimits, isWithinLimit, SUBSCRIPTION_TIERS } from '@homeforpup/shared-types';

export interface PremiumStatus {
  isPremium: boolean;
  canSeeVerifiedBadges: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
  tier: SubscriptionTier;
  limits: TierLimits;
  canCreateKennel: (currentCount: number) => boolean;
  canCreateDog: (currentCount: number) => boolean;
  canCreateLitter: (currentCount: number) => boolean;
  hasFeature: (feature: keyof TierLimits) => boolean;
}

/**
 * Check if a user has premium access
 * @param user - The user to check premium status for
 * @returns Premium status information
 */
export const usePremium = (user: User | null | undefined): PremiumStatus => {
  const tier: SubscriptionTier = (user?.subscriptionPlan as SubscriptionTier) || 'free';
  const limits = getTierLimits(tier);

  if (!user) {
    const freeLimits = getTierLimits('free');
    return {
      isPremium: false,
      canSeeVerifiedBadges: false,
      tier: 'free',
      limits: freeLimits,
      canCreateKennel: (count) => isWithinLimit(count, freeLimits.maxKennels),
      canCreateDog: (count) => isWithinLimit(count, freeLimits.maxParentDogs),
      canCreateLitter: (count) => isWithinLimit(count, freeLimits.maxActiveLitters),
      hasFeature: (feature) => {
        const val = freeLimits[feature];
        return typeof val === 'boolean' ? val : true;
      },
    };
  }

  // Check if user has active premium subscription
  const hasActivePremium =
    user.isPremium === true &&
    user.subscriptionStatus === 'active';

  // Check if user is on trial with premium features
  const hasTrialPremium =
    user.isPremium === true &&
    user.subscriptionStatus === 'trial';

  const isPremium = hasActivePremium || hasTrialPremium;

  return {
    isPremium,
    canSeeVerifiedBadges: isPremium,
    subscriptionPlan: user.subscriptionPlan,
    subscriptionStatus: user.subscriptionStatus,
    tier,
    limits,
    canCreateKennel: (currentCount) => isWithinLimit(currentCount, limits.maxKennels),
    canCreateDog: (currentCount) => isWithinLimit(currentCount, limits.maxParentDogs),
    canCreateLitter: (currentCount) => isWithinLimit(currentCount, limits.maxActiveLitters),
    hasFeature: (feature) => {
      const val = limits[feature];
      return typeof val === 'boolean' ? val : true;
    },
  };
};

/**
 * Utility function to check if a user can see verified badges
 * @param user - The user to check
 * @returns True if user has premium access
 */
export const canSeeVerifiedBadges = (user: User | null | undefined): boolean => {
  if (!user) return false;

  const hasActivePremium =
    user.isPremium === true &&
    user.subscriptionStatus === 'active';

  const hasTrialPremium =
    user.isPremium === true &&
    user.subscriptionStatus === 'trial';

  return hasActivePremium || hasTrialPremium;
};
