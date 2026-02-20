import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getProfileByUserId, updateSubscription } from '@/lib/stripe/subscriptionDb';
import { getStripePriceMapping } from '@/lib/stripe/priceMapping';
import { SubscriptionTier } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const profile = await getProfileByUserId(userId);
    if (!profile?.stripeCustomerId) {
      return NextResponse.json({ synced: false, reason: 'No Stripe customer' });
    }

    // Fetch active subscriptions from Stripe
    const subscriptions = await stripe.subscriptions.list({
      customer: profile.stripeCustomerId,
      status: 'all',
      limit: 1,
    });

    const activeSub = subscriptions.data.find(
      (s) => s.status === 'active' || s.status === 'trialing'
    );

    if (activeSub) {
      const priceId = activeSub.items.data[0]?.price?.id;
      const priceMapping = getStripePriceMapping();
      const tierInfo = priceId ? priceMapping[priceId] : null;
      const tier: SubscriptionTier = tierInfo?.tier || 'pro';

      const item = activeSub.items.data[0];
      const periodStart = item
        ? new Date(item.current_period_start * 1000).toISOString()
        : new Date(activeSub.start_date * 1000).toISOString();
      const periodEnd = item
        ? new Date(item.current_period_end * 1000).toISOString()
        : undefined;

      await updateSubscription(userId, {
        subscriptionPlan: tier,
        subscriptionStatus: activeSub.status === 'trialing' ? 'trial' : 'active',
        isPremium: true,
        stripeSubscriptionId: activeSub.id,
        subscriptionStartDate: periodStart,
        subscriptionEndDate: periodEnd,
      });

      return NextResponse.json({ synced: true, tier, status: activeSub.status });
    }

    // No active subscription — ensure profile reflects free tier
    if (profile.subscriptionPlan !== 'free') {
      await updateSubscription(userId, {
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        isPremium: false,
      });
    }

    return NextResponse.json({ synced: true, tier: 'free', status: 'active' });
  } catch (error) {
    console.error('Error syncing subscription:', error);
    return NextResponse.json(
      { error: 'Failed to sync subscription' },
      { status: 500 }
    );
  }
}
