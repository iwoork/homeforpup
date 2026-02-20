import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, groups, groupMembers, eq, inArray, desc } from '@homeforpup/database';

// GET /api/groups?userId=[id] - Get groups the user belongs to
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId query parameter is required' },
        { status: 400 }
      );
    }

    // Query group-members by userId to find which groups they belong to
    const memberships = await db.select().from(groupMembers)
      .where(eq(groupMembers.userId, userId));

    if (memberships.length === 0) {
      return NextResponse.json({ groups: [], count: 0 });
    }

    // Batch get the group details
    const groupIds = memberships.map((m) => m.groupId);
    const groupResults = await db.select().from(groups)
      .where(inArray(groups.id, groupIds));

    // Enrich with member's role and member count
    const groupsWithDetails = await Promise.all(
      groupResults.map(async (g) => {
        const membership = memberships.find((m) => m.groupId === g.id);
        // Get member count for this group
        const memberCountResult = await db.select().from(groupMembers)
          .where(eq(groupMembers.groupId, g.id));
        return {
          ...g,
          memberRole: membership?.role || 'member',
          memberCount: memberCountResult.length,
        };
      })
    );

    // Sort by createdAt descending
    groupsWithDetails.sort((a: any, b: any) => (b.createdAt || '').localeCompare(a.createdAt || ''));

    return NextResponse.json({
      groups: groupsWithDetails,
      count: groupsWithDetails.length,
    });
  } catch (error) {
    console.error('Error fetching groups:', error);
    return NextResponse.json(
      { error: 'Failed to fetch groups' },
      { status: 500 }
    );
  }
}

// POST /api/groups - Create a new group
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const body = await request.json();
    const { name, description, groupType, litterId, breederId, coverPhoto } = body;

    // Validate required fields
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json(
        { error: 'name is required' },
        { status: 400 }
      );
    }

    const VALID_GROUP_TYPES = ['litter', 'custom'] as const;
    if (!groupType || !VALID_GROUP_TYPES.includes(groupType)) {
      return NextResponse.json(
        { error: `groupType is required and must be one of: ${VALID_GROUP_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const groupId = `group-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

    const groupItem = {
      id: groupId,
      name: name.trim(),
      description: (description || '').trim(),
      type: groupType,
      createdBy: userId,
      coverImage: coverPhoto || '',
      createdAt: now,
      updatedAt: now,
    };

    // Create the group
    await db.insert(groups).values(groupItem);

    // Add the creator as admin member
    const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const memberItem = {
      id: memberId,
      groupId: groupId,
      userId: userId,
      role: 'admin',
      joinedAt: now,
    };

    await db.insert(groupMembers).values(memberItem);

    return NextResponse.json({
      message: 'Group created successfully',
      group: groupItem,
    });
  } catch (error) {
    console.error('Error creating group:', error);
    return NextResponse.json(
      { error: 'Failed to create group' },
      { status: 500 }
    );
  }
}
