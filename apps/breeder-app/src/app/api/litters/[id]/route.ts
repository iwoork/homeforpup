import { NextRequest, NextResponse } from 'next/server';
import { db, litters, eq } from '@homeforpup/database';
import { UpdateLitterRequest } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';

// GET /api/litters/[id] - Get litter details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;

    const [litter] = await db.select().from(litters).where(eq(litters.id, litterId)).limit(1);

    if (!litter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Check if user has access to this litter
    if (litter.breederId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    return NextResponse.json({ litter });
  } catch (error) {
    console.error('Error fetching litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/litters/[id] - Update litter
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;
    const body: UpdateLitterRequest = await request.json();

    // Get existing litter
    const [existingLitter] = await db.select().from(litters).where(eq(litters.id, litterId)).limit(1);

    if (!existingLitter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Check if user has permission to update
    if (existingLitter.breederId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    const fieldsToUpdate = [
      'name', 'expectedPuppyCount', 'actualPuppyCount', 'status',
      'birthDate', 'health', 'notes', 'specialInstructions', 'puppies'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field as keyof UpdateLitterRequest] !== undefined) {
        updateData[field] = body[field as keyof UpdateLitterRequest];
      }
    });

    const [updatedLitter] = await db.update(litters)
      .set(updateData)
      .where(eq(litters.id, litterId))
      .returning();

    return NextResponse.json({ litter: updatedLitter });
  } catch (error) {
    console.error('Error updating litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/litters/[id] - Delete litter
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: litterId } = await params;

    // Get existing litter
    const [existingLitter] = await db.select().from(litters).where(eq(litters.id, litterId)).limit(1);

    if (!existingLitter) {
      return NextResponse.json({ error: 'Litter not found' }, { status: 404 });
    }

    // Check if user has permission to delete
    if (existingLitter.breederId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Check if litter has puppies
    const litterPuppies = (existingLitter.puppies as any[]) || [];
    if (litterPuppies.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete litter with existing puppies. Please remove all puppies first.'
      }, { status: 400 });
    }

    // Delete litter
    await db.delete(litters).where(eq(litters.id, litterId));

    return NextResponse.json({ message: 'Litter deleted successfully' });
  } catch (error) {
    console.error('Error deleting litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
