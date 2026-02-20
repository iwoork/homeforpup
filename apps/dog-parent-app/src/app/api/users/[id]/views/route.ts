import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// POST - Increment profile views
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const profileUserId = params.id;

    if (!profileUserId || typeof profileUserId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Get current user
    const { userId: currentUserId } = await auth();

    // Don't count views from the profile owner
    if (currentUserId === profileUserId) {
      return NextResponse.json({
        message: 'Profile view not counted for own profile',
        success: true
      });
    }

    console.log('Incrementing profile views for user:', profileUserId.substring(0, 10) + '...');

    // First, get the user to check if they exist
    const [userItem] = await db.select().from(profiles)
      .where(eq(profiles.userId, profileUserId))
      .limit(1);

    if (!userItem) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is active
    if (userItem.accountStatus !== 'active') {
      return NextResponse.json(
        { message: 'User profile is not available' },
        { status: 404 }
      );
    }

    // Increment profile views using atomic counter
    const [result] = await db.update(profiles)
      .set({
        profileViews: sql`COALESCE(${profiles.profileViews}, 0) + 1`,
        updatedAt: new Date().toISOString()
      })
      .where(eq(profiles.userId, profileUserId))
      .returning({ profileViews: profiles.profileViews });

    const newViewCount = result?.profileViews || 0;

    console.log('Successfully incremented profile views. New count:', newViewCount);

    return NextResponse.json({
      message: 'Profile view recorded',
      profileViews: newViewCount,
      success: true
    });

  } catch (error) {
    console.error('Error incrementing profile views:', error);
    return NextResponse.json(
      {
        message: 'Error recording profile view',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// GET - Get current profile view count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const userId = params.id;

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        { message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    const [result] = await db.select({ profileViews: profiles.profileViews })
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!result) {
      return NextResponse.json(
        { message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      profileViews: result.profileViews || 0,
      success: true
    });

  } catch (error) {
    console.error('Error getting profile views:', error);
    return NextResponse.json(
      {
        message: 'Error getting profile views',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
