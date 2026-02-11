import { SubscriptionTier, BillingInterval } from '@homeforpup/shared-types';

interface PriceInfo {
  tier: SubscriptionTier;
  interval: BillingInterval;
}

// Server-only mapping from Stripe price IDs to tier/interval
export function getStripePriceMapping(): Record<string, PriceInfo> {
  const mapping: Record<string, PriceInfo> = {};

  const prices = [
    { env: 'STRIPE_PRICE_PRO_MONTHLY', tier: 'pro' as SubscriptionTier, interval: 'monthly' as BillingInterval },
    { env: 'STRIPE_PRICE_PRO_ANNUAL', tier: 'pro' as SubscriptionTier, interval: 'annual' as BillingInterval },
    { env: 'STRIPE_PRICE_PREMIUM_MONTHLY', tier: 'premium' as SubscriptionTier, interval: 'monthly' as BillingInterval },
    { env: 'STRIPE_PRICE_PREMIUM_ANNUAL', tier: 'premium' as SubscriptionTier, interval: 'annual' as BillingInterval },
    { env: 'STRIPE_PRICE_ENTERPRISE_MONTHLY', tier: 'enterprise' as SubscriptionTier, interval: 'monthly' as BillingInterval },
    { env: 'STRIPE_PRICE_ENTERPRISE_ANNUAL', tier: 'enterprise' as SubscriptionTier, interval: 'annual' as BillingInterval },
  ];

  for (const { env, tier, interval } of prices) {
    const priceId = process.env[env];
    if (priceId) {
      mapping[priceId] = { tier, interval };
    }
  }

  return mapping;
}

export function getStripePriceId(tier: SubscriptionTier, interval: BillingInterval): string | null {
  const envMap: Record<string, string> = {
    'pro_monthly': 'STRIPE_PRICE_PRO_MONTHLY',
    'pro_annual': 'STRIPE_PRICE_PRO_ANNUAL',
    'premium_monthly': 'STRIPE_PRICE_PREMIUM_MONTHLY',
    'premium_annual': 'STRIPE_PRICE_PREMIUM_ANNUAL',
    'enterprise_monthly': 'STRIPE_PRICE_ENTERPRISE_MONTHLY',
    'enterprise_annual': 'STRIPE_PRICE_ENTERPRISE_ANNUAL',
  };

  const envVar = envMap[`${tier}_${interval}`];
  if (!envVar) return null;
  return process.env[envVar] || null;
}
