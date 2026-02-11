// Subscription tier types and pricing configuration

export type SubscriptionTier = 'free' | 'pro' | 'premium' | 'enterprise';
export type BillingInterval = 'monthly' | 'annual';

export interface TierLimits {
  maxKennels: number; // -1 = unlimited
  maxParentDogs: number;
  maxActiveLitters: number;
  waitlistManagement: boolean;
  aiRecommendations: boolean;
  advancedAnalytics: boolean;
  contractsAndPayments: boolean;
  brandedWebsite: boolean;
  multiLocation: boolean;
  apiDataExport: boolean;
  prioritySupport: boolean;
}

export interface TierDefinition {
  id: SubscriptionTier;
  name: string;
  tagline: string;
  monthlyPrice: number;
  annualPricePerMonth: number;
  annualTotal: number;
  annualSavings: number;
  limits: TierLimits;
  features: string[];
  badge?: string;
}

export const SUBSCRIPTION_TIERS: Record<SubscriptionTier, TierDefinition> = {
  free: {
    id: 'free',
    name: 'Free',
    tagline: 'Get started with the basics',
    monthlyPrice: 0,
    annualPricePerMonth: 0,
    annualTotal: 0,
    annualSavings: 0,
    limits: {
      maxKennels: 1,
      maxParentDogs: 4,
      maxActiveLitters: 2,
      waitlistManagement: false,
      aiRecommendations: false,
      advancedAnalytics: false,
      contractsAndPayments: false,
      brandedWebsite: false,
      multiLocation: false,
      apiDataExport: false,
      prioritySupport: false,
    },
    features: [
      '1 Kennel',
      'Up to 4 Parent Dogs',
      'Up to 2 Active Litters',
      'Basic Messaging',
      'Community Access',
    ],
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    tagline: 'For growing breeders',
    monthlyPrice: 39,
    annualPricePerMonth: 29,
    annualTotal: 348,
    annualSavings: 120,
    limits: {
      maxKennels: 1,
      maxParentDogs: 20,
      maxActiveLitters: -1,
      waitlistManagement: true,
      aiRecommendations: true,
      advancedAnalytics: false,
      contractsAndPayments: false,
      brandedWebsite: false,
      multiLocation: false,
      apiDataExport: false,
      prioritySupport: false,
    },
    features: [
      '1 Kennel',
      'Up to 20 Parent Dogs',
      'Unlimited Active Litters',
      'Waitlist Management',
      'AI Recommendations',
      'Priority Messaging',
    ],
    badge: 'Most Popular',
  },
  premium: {
    id: 'premium',
    name: 'Premium',
    tagline: 'For established breeders',
    monthlyPrice: 99,
    annualPricePerMonth: 79,
    annualTotal: 948,
    annualSavings: 240,
    limits: {
      maxKennels: 5,
      maxParentDogs: 100,
      maxActiveLitters: -1,
      waitlistManagement: true,
      aiRecommendations: true,
      advancedAnalytics: true,
      contractsAndPayments: true,
      brandedWebsite: true,
      multiLocation: false,
      apiDataExport: false,
      prioritySupport: false,
    },
    features: [
      'Up to 5 Kennels',
      'Up to 100 Parent Dogs',
      'Unlimited Active Litters',
      'Waitlist Management',
      'AI Recommendations',
      'Advanced Analytics',
      'Contracts & Payments',
      'Branded Website',
    ],
  },
  enterprise: {
    id: 'enterprise',
    name: 'Enterprise',
    tagline: 'For large-scale operations',
    monthlyPrice: 249,
    annualPricePerMonth: 199,
    annualTotal: 2388,
    annualSavings: 600,
    limits: {
      maxKennels: -1,
      maxParentDogs: -1,
      maxActiveLitters: -1,
      waitlistManagement: true,
      aiRecommendations: true,
      advancedAnalytics: true,
      contractsAndPayments: true,
      brandedWebsite: true,
      multiLocation: true,
      apiDataExport: true,
      prioritySupport: true,
    },
    features: [
      'Unlimited Kennels',
      'Unlimited Parent Dogs',
      'Unlimited Active Litters',
      'All Pro & Premium Features',
      'Multi-Location Support',
      'API & Data Export',
      'Priority Support',
    ],
  },
};

export function getTierLimits(tier: SubscriptionTier): TierLimits {
  return SUBSCRIPTION_TIERS[tier].limits;
}

export function isWithinLimit(current: number, limit: number): boolean {
  if (limit === -1) return true; // unlimited
  return current < limit;
}

export function getTierByStripePriceId(
  priceId: string,
  priceMapping: Record<string, { tier: SubscriptionTier; interval: BillingInterval }>
): { tier: SubscriptionTier; interval: BillingInterval } | null {
  return priceMapping[priceId] || null;
}
