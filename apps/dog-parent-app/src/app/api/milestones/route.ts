import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, milestones, eq, asc } from '@homeforpup/database';

const VALID_MILESTONE_TYPES = ['weight', 'health', 'training', 'social', 'first'] as const;
type MilestoneType = typeof VALID_MILESTONE_TYPES[number];

// GET /api/milestones?litterId=[id] - Get milestones for a litter sorted by date
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const litterId = searchParams.get('litterId');

    if (!litterId) {
      return NextResponse.json(
        { error: 'litterId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.select().from(milestones)
      .where(eq(milestones.litterId, litterId))
      .orderBy(asc(milestones.date))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      milestones: result,
      lastKey: null,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching milestones:', error);
    return NextResponse.json(
      { error: 'Failed to fetch milestones' },
      { status: 500 }
    );
  }
}

// POST /api/milestones - Create a new milestone
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { litterId, breederId, title, description, milestoneType, date, photos } = body;

    // Validate required fields
    if (!litterId || typeof litterId !== 'string' || litterId.trim().length === 0) {
      return NextResponse.json(
        { error: 'litterId is required' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    if (!date || typeof date !== 'string') {
      return NextResponse.json(
        { error: 'date is required' },
        { status: 400 }
      );
    }

    if (milestoneType && !VALID_MILESTONE_TYPES.includes(milestoneType)) {
      return NextResponse.json(
        { error: `milestoneType must be one of: ${VALID_MILESTONE_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const milestoneItem = {
      id: `milestone-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      litterId: litterId.trim(),
      type: (milestoneType || 'first') as MilestoneType,
      title: title.trim(),
      description: (description || '').trim(),
      date,
      photos: Array.isArray(photos) ? photos : [],
      createdAt: now,
    };

    await db.insert(milestones).values(milestoneItem);

    return NextResponse.json({
      message: 'Milestone created successfully',
      milestone: milestoneItem,
    });
  } catch (error) {
    console.error('Error creating milestone:', error);
    return NextResponse.json(
      { error: 'Failed to create milestone' },
      { status: 500 }
    );
  }
}
