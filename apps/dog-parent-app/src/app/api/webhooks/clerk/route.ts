import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { db, profiles, eq } from '@homeforpup/database';

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Verify the webhook signature
  const svixId = request.headers.get('svix-id');
  const svixTimestamp = request.headers.get('svix-timestamp');
  const svixSignature = request.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await request.text();

  let event: any;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const eventType = event.type;
  console.log(`Clerk webhook received: ${eventType}`);

  try {
    if (eventType === 'user.created' || eventType === 'user.updated') {
      const { id, email_addresses, first_name, last_name, public_metadata, image_url } = event.data;

      const primaryEmail = email_addresses?.find((e: any) => e.id === event.data.primary_email_address_id);
      const email = primaryEmail?.email_address || '';
      const name = [first_name, last_name].filter(Boolean).join(' ') || email.split('@')[0] || 'User';
      const userType = (public_metadata?.userType as string) || 'dog-parent';

      const timestamp = new Date().toISOString();

      // Check if user already exists
      const [existingUser] = await db.select().from(profiles)
        .where(eq(profiles.userId, id))
        .limit(1);

      const isNewUser = !existingUser;

      const userData: Record<string, any> = {
        userId: id,
        email,
        name,
        firstName: first_name || null,
        lastName: last_name || null,
        displayName: existingUser?.displayName || name,
        userType: existingUser?.userType || userType,
        profileImage: image_url || existingUser?.profileImage || null,
        verified: primaryEmail?.verification?.status === 'verified',
        accountStatus: existingUser?.accountStatus || 'active',
        createdAt: existingUser?.createdAt || timestamp,
        updatedAt: timestamp,
        lastActiveAt: timestamp,
      };

      // Preserve existing fields
      if (existingUser?.phone) userData.phone = existingUser.phone;
      if (existingUser?.location) userData.location = existingUser.location;
      if (existingUser?.bio) userData.bio = existingUser.bio;
      if (existingUser?.preferences) userData.preferences = existingUser.preferences;
      if (existingUser?.breederInfo) userData.breederInfo = existingUser.breederInfo;
      if (existingUser?.puppyParentInfo) userData.puppyParentInfo = existingUser.puppyParentInfo;

      if (isNewUser) {
        await db.insert(profiles).values(userData as typeof profiles.$inferInsert);
      } else {
        await db.update(profiles)
          .set(userData)
          .where(eq(profiles.userId, id));
      }

      console.log(`User ${isNewUser ? 'created' : 'updated'} via webhook:`, {
        userId: id.substring(0, 10) + '...',
        email,
        userType: userData.userType,
      });
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error processing webhook:', error);
    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
  }
}
