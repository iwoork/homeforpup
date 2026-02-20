import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, waitlist, eq } from '@homeforpup/database';

// PUT /api/litters/[litterId]/waitlist/[entryId] - Update a waitlist entry
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ litterId: string; entryId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId, entryId } = await context.params;
    const body = await request.json();

    // Build update object dynamically
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    const fields = [
      'userName', 'userEmail', 'position',
      'status', 'notes',
    ];

    // Map legacy field names to schema fields
    if (body.buyerName !== undefined) updates.userName = body.buyerName;
    if (body.buyerEmail !== undefined) updates.userEmail = body.buyerEmail;
    if (body.buyerPhone !== undefined) updates.notes = body.buyerPhone; // Store in notes if no dedicated field

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    const [updated] = await db.update(waitlist)
      .set(updates)
      .where(eq(waitlist.id, entryId))
      .returning();

    return NextResponse.json({ entry: updated });
  } catch (error) {
    console.error('Error updating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to update waitlist entry' },
      { status: 500 }
    );
  }
}

// DELETE /api/litters/[litterId]/waitlist/[entryId] - Remove a waitlist entry
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ litterId: string; entryId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId, entryId } = await context.params;

    // Verify the entry exists
    const [existing] = await db.select().from(waitlist)
      .where(eq(waitlist.id, entryId))
      .limit(1);

    if (!existing) {
      return NextResponse.json(
        { error: 'Waitlist entry not found' },
        { status: 404 }
      );
    }

    await db.delete(waitlist).where(eq(waitlist.id, entryId));

    return NextResponse.json({ message: 'Waitlist entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to delete waitlist entry' },
      { status: 500 }
    );
  }
}
