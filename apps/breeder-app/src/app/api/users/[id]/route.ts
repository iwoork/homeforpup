import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    // Get user session for authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from database
    const [result] = await db.select().from(profiles).where(eq(profiles.userId, requestedUserId)).limit(1);

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: requestedUserId } = await params;

    // Get user session for authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is updating their own profile
    if (userId !== requestedUserId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await request.json();
    const timestamp = new Date().toISOString();

    // Get existing user data
    const [existingUser] = await db.select().from(profiles).where(eq(profiles.userId, requestedUserId)).limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data from body, preserving existing fields
    const updateData: Record<string, any> = {
      updatedAt: timestamp,
      lastActiveAt: timestamp,
    };

    // Merge in any provided fields
    const allowedFields = [
      'name', 'displayName', 'firstName', 'lastName', 'phone', 'location',
      'bio', 'profileImage', 'coverPhoto', 'socialLinks', 'preferences',
      'breederInfo', 'userType', 'galleryPhotos'
    ];

    allowedFields.forEach(field => {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    });

    // Update user
    const [updatedUser] = await db.update(profiles)
      .set(updateData)
      .where(eq(profiles.userId, requestedUserId))
      .returning();

    return NextResponse.json({
      user: updatedUser,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      {
        error: 'Failed to update user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
