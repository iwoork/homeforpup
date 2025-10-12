/**
 * Hook to check if a user has premium access
 * Premium users can see verified badges for dog parents and breeders
 */

import { User } from '@homeforpup/shared-types';

export interface PremiumStatus {
  isPremium: boolean;
  canSeeVerifiedBadges: boolean;
  subscriptionPlan?: string;
  subscriptionStatus?: string;
}

/**
 * Check if a user has premium access
 * @param user - The user to check premium status for
 * @returns Premium status information
 */
export const usePremium = (user: User | null | undefined): PremiumStatus => {
  if (!user) {
    return {
      isPremium: false,
      canSeeVerifiedBadges: false,
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

