import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// PUT /api/users/[id]/userType - Update user type
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const params = await context.params;
    const targetUserId = params.id;
    console.log('UserType update API called for userId:', targetUserId);

    const { userId } = await auth();
    if (!userId) {
      console.log('No session found');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only allow users to update their own userType
    if (targetUserId !== userId) {
      console.log('Unauthorized: userId mismatch', { targetUserId, userId });
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const body = await request.json();
    const { userType } = body;
    console.log('Request body:', body);

    if (!userType || !['breeder', 'dog-parent', 'both'].includes(userType)) {
      console.log('Invalid userType:', userType);
      return NextResponse.json({ error: 'Invalid userType. Must be breeder, adopter, or both' }, { status: 400 });
    }

    // First, get the existing user to verify they exist
    const [existingUser] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    console.log('Existing user:', existingUser);
    if (!existingUser) {
      console.log('User not found in database');
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Update the userType
    const [result] = await db.update(profiles)
      .set({
        userType,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(profiles.userId, userId))
      .returning();

    console.log('Update result:', result);

    console.log(`User ${userId} userType updated to: ${userType}`);

    return NextResponse.json({
      success: true,
      user: result,
      message: `User type updated to ${userType}`
    });
  } catch (error) {
    console.error('Error updating user type:', error);
    return NextResponse.json({ error: 'Failed to update user type' }, { status: 500 });
  }
}
