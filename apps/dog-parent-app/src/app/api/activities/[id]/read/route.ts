import { NextRequest, NextResponse } from 'next/server';
import { db, activities, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// POST /api/activities/[id]/read - Mark activity as read
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: activityId } = await params;

    // First, get the activity to verify ownership
    const [activity] = await db.select().from(activities).where(eq(activities.id, activityId)).limit(1);

    if (!activity) {
      return NextResponse.json({ error: 'Activity not found' }, { status: 404 });
    }

    // Verify the activity belongs to the authenticated user
    if (activity.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the activity to mark as read
    const [updated] = await db.update(activities)
      .set({ read: true })
      .where(eq(activities.id, activityId))
      .returning();

    return NextResponse.json({
      success: true,
      activity: updated
    });
  } catch (error) {
    console.error('Error marking activity as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark activity as read' },
      { status: 500 }
    );
  }
}
