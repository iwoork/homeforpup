import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();

    // Validate required fields
    const required = ['activityLevel', 'livingSpace', 'familySize', 'experienceLevel'];
    for (const field of required) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `Missing required field: ${field}` },
          { status: 400 }
        );
      }
    }

    const matchPreferences = {
      activityLevel: body.activityLevel,
      livingSpace: body.livingSpace,
      familySize: body.familySize,
      childrenAges: body.childrenAges || [],
      experienceLevel: body.experienceLevel,
      size: body.size || [],
      updatedAt: new Date().toISOString(),
    };

    // Get current profile to merge puppyParentInfo
    const [currentProfile] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const existingInfo = (currentProfile?.puppyParentInfo as any) || {};

    await db.update(profiles)
      .set({
        puppyParentInfo: { ...existingInfo, matchPreferences },
        updatedAt: new Date().toISOString(),
      })
      .where(eq(profiles.userId, userId));

    return NextResponse.json({
      matchPreferences,
      message: 'Preferences saved successfully',
    });
  } catch (error) {
    console.error('Error saving match preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to save preferences',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [profile] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    return NextResponse.json({
      matchPreferences: (profile?.puppyParentInfo as any)?.matchPreferences || null,
    });
  } catch (error) {
    console.error('Error fetching match preferences:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch preferences',
        details:
          process.env.NODE_ENV === 'development' ? String(error) : undefined,
      },
      { status: 500 }
    );
  }
}
