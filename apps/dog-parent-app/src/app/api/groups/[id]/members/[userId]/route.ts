import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, groupMembers, eq, and } from '@homeforpup/database';

// DELETE /api/groups/[id]/members/[userId] - Remove a member from a group (requires admin role)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: groupId, userId: targetUserId } = await context.params;

    // Check if the current user is an admin of this group
    const [callerMembership] = await db.select().from(groupMembers)
      .where(and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, userId)))
      .limit(1);

    if (!callerMembership || callerMembership.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only group admins can remove members' },
        { status: 403 }
      );
    }

    // Delete the member
    await db.delete(groupMembers).where(
      and(eq(groupMembers.groupId, groupId), eq(groupMembers.userId, targetUserId))
    );

    return NextResponse.json({
      message: 'Member removed successfully',
    });
  } catch (error) {
    console.error('Error removing group member:', error);
    return NextResponse.json(
      { error: 'Failed to remove group member' },
      { status: 500 }
    );
  }
}
