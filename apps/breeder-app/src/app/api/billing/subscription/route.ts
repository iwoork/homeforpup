import { NextRequest, NextResponse } from 'next/server';
import { getProfileByUserId } from '@/lib/stripe/subscriptionDb';
import { getTierLimits, SUBSCRIPTION_TIERS, SubscriptionTier } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    const tier = (profile?.subscriptionPlan as SubscriptionTier) || 'free';
    const limits = getTierLimits(tier);
    const tierDef = SUBSCRIPTION_TIERS[tier];

    return NextResponse.json({
      tier,
      tierName: tierDef.name,
      status: profile?.subscriptionStatus || 'active',
      isPremium: profile?.isPremium || false,
      limits,
      stripeCustomerId: profile?.stripeCustomerId || null,
      stripeSubscriptionId: profile?.stripeSubscriptionId || null,
      subscriptionStartDate: profile?.subscriptionStartDate || null,
      subscriptionEndDate: profile?.subscriptionEndDate || null,
    });
  } catch (error) {
    console.error('Error fetching subscription:', error);
    return NextResponse.json(
      { error: 'Failed to fetch subscription data' },
      { status: 500 }
    );
  }
}
