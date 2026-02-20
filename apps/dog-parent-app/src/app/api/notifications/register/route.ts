import { NextRequest, NextResponse } from 'next/server';
import { db, deviceTokens, eq, and } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// POST /api/notifications/register - Register a device token
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { deviceToken, platform, deviceName } = body;

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    const now = new Date().toISOString();
    const item = {
      id: uuidv4(),
      userId: userId,
      token: deviceToken,
      platform: platform || 'ios',
      deviceName: deviceName || 'Unknown Device',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(deviceTokens).values(item);

    return NextResponse.json({
      success: true,
      data: { registration: item },
    });
  } catch (error) {
    console.error('Error registering device token:', error);
    return NextResponse.json(
      { error: 'Failed to register device token' },
      { status: 500 },
    );
  }
}

// DELETE /api/notifications/register - Unregister a device token
export async function DELETE(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const deviceToken = searchParams.get('deviceToken');

    if (!deviceToken) {
      return NextResponse.json({ error: 'deviceToken is required' }, { status: 400 });
    }

    await db.delete(deviceTokens).where(
      and(eq(deviceTokens.userId, userId), eq(deviceTokens.token, deviceToken))
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error unregistering device token:', error);
    return NextResponse.json(
      { error: 'Failed to unregister device token' },
      { status: 500 },
    );
  }
}

// GET /api/notifications/register - Get registered device tokens for user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const result = await db.select().from(deviceTokens)
      .where(eq(deviceTokens.userId, userId));

    return NextResponse.json({
      success: true,
      data: { tokens: result },
    });
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    return NextResponse.json(
      { error: 'Failed to fetch device tokens' },
      { status: 500 },
    );
  }
}
