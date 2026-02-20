import { NextRequest, NextResponse } from 'next/server';
import { db, activities, eq, and } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// POST /api/activities/mark-all-read - Mark all user activities as read
export async function POST(_request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Update all unread activities for the user in a single query
    const result = await db.update(activities)
      .set({ read: true })
      .where(and(eq(activities.userId, userId), eq(activities.read, false)));

    return NextResponse.json({
      success: true,
      updatedCount: 0 // Drizzle doesn't return count for updates without returning() by default
    });
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all activities as read' },
      { status: 500 }
    );
  }
}
