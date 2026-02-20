import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getStripePriceId } from '@/lib/stripe/priceMapping';
import { getProfileByUserId, updateSubscription } from '@/lib/stripe/subscriptionDb';
import { SubscriptionTier, BillingInterval } from '@homeforpup/shared-types';

import { auth, currentUser } from '@clerk/nextjs/server';
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const { tier, interval } = (await request.json()) as {
      tier: SubscriptionTier;
      interval: BillingInterval;
    };

    if (!tier || !interval || tier === 'free') {
      return NextResponse.json({ error: 'Invalid tier or interval' }, { status: 400 });
    }

    const priceId = getStripePriceId(tier, interval);
    if (!priceId) {
      return NextResponse.json({ error: 'Price not configured for this tier/interval' }, { status: 400 });
    }

    const profile = await getProfileByUserId(userId);

    // Get or create Stripe customer
    let customerId = profile?.stripeCustomerId;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: clerkUser?.primaryEmailAddress?.emailAddress || '' || undefined,
        name: clerkUser?.fullName || clerkUser?.firstName || '' || undefined,
        metadata: { userId: userId },
      });
      customerId = customer.id;

      // Store customer ID on profile
      await updateSubscription(userId, { stripeCustomerId: customerId });
    }

    // Determine if first-time subscriber (for trial)
    const isFirstTimeSub = !profile?.stripeSubscriptionId;

    const checkoutSession = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      ...(isFirstTimeSub && {
        subscription_data: {
          trial_period_days: 14,
        },
      }),
      success_url: `${request.nextUrl.origin}/dashboard/billing?success=true`,
      cancel_url: `${request.nextUrl.origin}/pricing?cancelled=true`,
      metadata: {
        userId: userId,
        tier,
        interval,
      },
    });

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error) {
    console.error('Error creating checkout session:', error);
    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
