import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe';
import { getStripePriceMapping } from '@/lib/stripe/priceMapping';
import { getProfileByStripeCustomerId, updateSubscription } from '@/lib/stripe/subscriptionDb';
import { SubscriptionTier } from '@homeforpup/shared-types';
import Stripe from 'stripe';

function getSubscriptionPeriod(subscription: Stripe.Subscription) {
  const item = subscription.items.data[0];
  return {
    start: item ? new Date(item.current_period_start * 1000).toISOString() : new Date(subscription.start_date * 1000).toISOString(),
    end: item ? new Date(item.current_period_end * 1000).toISOString() : undefined,
  };
}

export async function POST(request: NextRequest) {
  const body = await request.text();
  const signature = request.headers.get('stripe-signature');

  if (!signature || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ error: 'Missing signature or webhook secret' }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode !== 'subscription' || !session.customer || !session.subscription) break;

        const customerId = typeof session.customer === 'string' ? session.customer : session.customer.id;
        const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;

        // Fetch the subscription to get the price ID
        const subscription = await stripe.subscriptions.retrieve(subscriptionId);
        const priceId = subscription.items.data[0]?.price?.id;
        const priceMapping = getStripePriceMapping();
        const tierInfo = priceId ? priceMapping[priceId] : null;
        const tier: SubscriptionTier = tierInfo?.tier || 'pro';
        const period = getSubscriptionPeriod(subscription);

        // Find profile by Stripe customer ID or session metadata
        const profile = await getProfileByStripeCustomerId(customerId);
        const userId = profile?.userId || session.metadata?.userId;

        if (userId) {
          await updateSubscription(userId, {
            subscriptionPlan: tier,
            subscriptionStatus: subscription.status === 'trialing' ? 'trial' : 'active',
            isPremium: true,
            stripeCustomerId: customerId,
            stripeSubscriptionId: subscriptionId,
            subscriptionStartDate: period.start,
            subscriptionEndDate: period.end,
          });
          console.log(`Subscription activated: ${userId} -> ${tier}`);
        }
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const profile = await getProfileByStripeCustomerId(customerId);

        if (profile) {
          const priceId = subscription.items.data[0]?.price?.id;
          const priceMapping = getStripePriceMapping();
          const tierInfo = priceId ? priceMapping[priceId] : null;
          const period = getSubscriptionPeriod(subscription);

          const statusMap: Record<string, string> = {
            active: 'active',
            trialing: 'trial',
            past_due: 'past_due',
            canceled: 'cancelled',
            unpaid: 'past_due',
          };

          await updateSubscription(profile.userId, {
            subscriptionPlan: tierInfo?.tier || (profile.subscriptionPlan as SubscriptionTier),
            subscriptionStatus: statusMap[subscription.status] || 'active',
            isPremium: subscription.status === 'active' || subscription.status === 'trialing',
            subscriptionStartDate: period.start,
            subscriptionEndDate: period.end,
          });
          console.log(`Subscription updated: ${profile.userId} -> ${tierInfo?.tier || 'unchanged'}`);
        }
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
        const profile = await getProfileByStripeCustomerId(customerId);

        if (profile) {
          await updateSubscription(profile.userId, {
            subscriptionPlan: 'free',
            subscriptionStatus: 'cancelled',
            isPremium: false,
            stripeSubscriptionId: undefined,
            subscriptionEndDate: new Date().toISOString(),
          });
          console.log(`Subscription cancelled: ${profile.userId} -> free`);
        }
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        if (!customerId) break;

        const profile = await getProfileByStripeCustomerId(customerId);
        if (profile) {
          await updateSubscription(profile.userId, {
            subscriptionStatus: 'past_due',
          });
          console.log(`Payment failed: ${profile.userId} -> past_due`);
        }
        break;
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 500 });
  }
}
