import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, groupMembers, eq, and } from '@homeforpup/database';

// GET /api/groups/[id]/members - Get members of a group
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id: groupId } = await context.params;

    const result = await db.select().from(groupMembers)
      .where(eq(groupMembers.groupId, groupId));

    const members = result.map((item) => ({
      groupId: item.groupId,
      userId: item.userId,
      role: item.role,
      joinedAt: item.joinedAt,
    }));

    return NextResponse.json({
      members,
      count: members.length,
    });
  } catch (error) {
    console.error('Error fetching group members:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group members' },
      { status: 500 }
    );
  }
}

// POST /api/groups/[id]/members - Add a member to a group (requires admin role)
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId } = await context.params;

    // Check if the current user is an admin of this group
    const [callerMembership] = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);

    if (!callerMembership || callerMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admins can add members' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { userId: memberUserId, userName, role } = body;

    if (!memberUserId || typeof memberUserId !== 'string') {
      return NextResponse.json(
        { error: 'userId is required' },
        { status: 400 }
      );
    }

    const validRoles = ['admin', 'member'] as const;
    const memberRole = validRoles.includes(role) ? role : 'member';

    const memberId = `member-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const memberItem = {
      id: memberId,
      groupId,
      userId: memberUserId,
      role: memberRole,
      joinedAt: new Date().toISOString(),
    };

    await db.insert(groupMembers).values(memberItem);

    return NextResponse.json({
      message: 'Member added successfully',
      member: memberItem,
    });
  } catch (error) {
    console.error('Error adding group member:', error);
    return NextResponse.json(
      { error: 'Failed to add group member' },
      { status: 500 }
    );
  }
}
