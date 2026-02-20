import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, groups, groupMembers, eq } from '@homeforpup/database';

// GET /api/groups/[id] - Get group details including member count
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    // Get group details
    const [group] = await db.select().from(groups)
      .where(eq(groups.id, id))
      .limit(1);

    if (!group) {
      return NextResponse.json(
        { error: 'Group not found' },
        { status: 404 }
      );
    }

    // Get member count
    const members = await db.select().from(groupMembers)
      .where(eq(groupMembers.groupId, id));

    return NextResponse.json({
      group: {
        ...group,
        memberCount: members.length,
      },
    });
  } catch (error) {
    console.error('Error fetching group:', error);
    return NextResponse.json(
      { error: 'Failed to fetch group' },
      { status: 500 }
    );
  }
}
