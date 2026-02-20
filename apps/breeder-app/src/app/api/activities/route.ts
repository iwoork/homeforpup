import { NextRequest, NextResponse } from 'next/server';
import { db, activities, eq, and, inArray, sql } from '@homeforpup/database';
import { Activity, ActivityFilter, ActivityResponse, ActivityStats, CreateActivityRequest } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';

// GET /api/activities - Fetch user activities
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const filters: ActivityFilter = {
      userId: userId,
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
    };

    // Parse filters from query params
    if (searchParams.get('types')) {
      filters.types = searchParams.get('types')!.split(',') as any[];
    }
    if (searchParams.get('categories')) {
      filters.categories = searchParams.get('categories')!.split(',') as any[];
    }
    if (searchParams.get('priority')) {
      filters.priority = searchParams.get('priority')!.split(',') as any[];
    }
    if (searchParams.get('read') !== null) {
      filters.read = searchParams.get('read') === 'true';
    }
    if (searchParams.get('start') && searchParams.get('end')) {
      filters.dateRange = {
        start: searchParams.get('start')!,
        end: searchParams.get('end')!,
      };
    }

    // Build where conditions
    const conditions: any[] = [eq(activities.userId, filters.userId!)];

    if (filters.types?.length) {
      conditions.push(inArray(activities.type, filters.types));
    }

    if (filters.categories?.length) {
      conditions.push(inArray(activities.category, filters.categories));
    }

    if (filters.priority?.length) {
      conditions.push(inArray(activities.priority, filters.priority));
    }

    if (filters.read !== undefined) {
      conditions.push(eq(activities.read, filters.read));
    }

    if (filters.dateRange) {
      conditions.push(
        sql`${activities.timestamp} >= ${filters.dateRange.start}`,
        sql`${activities.timestamp} <= ${filters.dateRange.end}`
      );
    }

    // Execute query
    const allActivities = await db.select().from(activities).where(and(...conditions));

    const activityList = allActivities as Activity[];

    // Sort by timestamp (newest first)
    activityList.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    // Apply pagination
    const startIndex = filters.offset || 0;
    const endIndex = startIndex + (filters.limit || 20);
    const paginatedActivities = activityList.slice(startIndex, endIndex);

    // Calculate stats
    const stats: ActivityStats = {
      total: activityList.length,
      unread: activityList.filter(a => !a.read).length,
      byType: {} as Record<string, number>,
      byCategory: {} as Record<string, number>,
      byPriority: { low: 0, medium: 0, high: 0 },
      recent: activityList.slice(0, 5),
    };

    // Count by type
    activityList.forEach(activity => {
      stats.byType[activity.type] = (stats.byType[activity.type] || 0) + 1;
      stats.byCategory[activity.category] = (stats.byCategory[activity.category] || 0) + 1;
      stats.byPriority[activity.priority]++;
    });

    const response: ActivityResponse = {
      activities: paginatedActivities,
      total: activityList.length,
      hasMore: endIndex < activityList.length,
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching activities:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activities' },
      { status: 500 }
    );
  }
}

// POST /api/activities - Create new activity
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: CreateActivityRequest = await request.json();

    // Validate required fields
    if (!body.userId || !body.type || !body.title || !body.description || !body.category) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Ensure the activity belongs to the authenticated user
    if (body.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized to create activity for this user' },
        { status: 403 }
      );
    }

    const activity: Activity = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId: body.userId,
      type: body.type,
      title: body.title,
      description: body.description,
      metadata: body.metadata,
      timestamp: new Date().toISOString(),
      read: false,
      priority: body.priority || 'medium',
      category: body.category,
    };

    await db.insert(activities).values(activity);

    return NextResponse.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    return NextResponse.json(
      { error: 'Failed to create activity' },
      { status: 500 }
    );
  }
}
