import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient, GetCommand, PutCommand } from '@aws-sdk/lib-dynamodb';

const client = new DynamoDBClient({
  region: process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

const dynamodb = DynamoDBDocumentClient.from(client, {
  marshallOptions: { removeUndefinedValues: true },
});

const USERS_TABLE = process.env.USERS_TABLE_NAME || process.env.PROFILES_TABLE_NAME || 'homeforpup-profiles';

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
      const existingResult = await dynamodb.send(new GetCommand({
        TableName: USERS_TABLE,
        Key: { userId: id },
      }));

      const existingUser = existingResult.Item;
      const isNewUser = !existingUser;

      const userData = {
        userId: id,
        email,
        name,
        firstName: first_name || undefined,
        lastName: last_name || undefined,
        displayName: existingUser?.displayName || name,
        userType: existingUser?.userType || userType,
        profileImage: image_url || existingUser?.profileImage || undefined,
        verified: primaryEmail?.verification?.status === 'verified',
        accountStatus: existingUser?.accountStatus || 'active',
        createdAt: existingUser?.createdAt || timestamp,
        updatedAt: timestamp,
        lastActiveAt: timestamp,
        // Preserve existing fields
        ...(existingUser?.phone && { phone: existingUser.phone }),
        ...(existingUser?.location && { location: existingUser.location }),
        ...(existingUser?.bio && { bio: existingUser.bio }),
        ...(existingUser?.preferences && { preferences: existingUser.preferences }),
        ...(existingUser?.breederInfo && { breederInfo: existingUser.breederInfo }),
        ...(existingUser?.adopterInfo && { adopterInfo: existingUser.adopterInfo }),
      };

      await dynamodb.send(new PutCommand({
        TableName: USERS_TABLE,
        Item: userData,
      }));

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
