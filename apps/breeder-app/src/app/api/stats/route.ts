import { NextRequest, NextResponse } from 'next/server';
import { db, activities, eq, and, sql } from '@homeforpup/database';
import { ActivityStats, Activity } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';

// GET /api/activities/stats - Get activity statistics
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'week';

    // Calculate date range based on period
    const now = new Date();
    let startDate: Date;

    switch (period) {
      case 'day':
        startDate = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        break;
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    }

    // Query activities for the user within the date range
    const allActivities = await db.select().from(activities).where(
      and(
        eq(activities.userId, userId),
        sql`${activities.timestamp} >= ${startDate.toISOString()}`
      )
    );

    const activityList = allActivities as Activity[];

    // Calculate statistics
    const stats: ActivityStats = {
      total: activityList.length,
      unread: activityList.filter(a => !a.read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: { low: 0, medium: 0, high: 0 },
      recent: activityList
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5),
    };

    // Count by type and category
    activityList.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.byCategory[activity.category] = (stats.byCategory[activity.category] || 0) + 1;
      stats.byPriority[activity.priority]++;
    });

    return NextResponse.json(stats);
  } catch (error) {
    console.error('Error fetching activity stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity stats' },
      { status: 500 }
    );
  }
}
