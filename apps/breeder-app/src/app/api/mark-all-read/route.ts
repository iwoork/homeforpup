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

    // Get all unread activities for the user
    const unreadActivities = await db.select().from(activities).where(
      and(
        eq(activities.userId, userId),
        eq(activities.read, false)
      )
    );

    // Update each unread activity
    const updatePromises = unreadActivities.map(activity =>
      db.update(activities)
        .set({ read: true })
        .where(eq(activities.id, activity.id))
    );

    await Promise.all(updatePromises);

    return NextResponse.json({
      success: true,
      updatedCount: unreadActivities.length
    });
  } catch (error) {
    console.error('Error marking all activities as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark all activities as read' },
      { status: 500 }
    );
  }
}
