import { NextRequest, NextResponse } from 'next/server';
import { db, kennels, dogs, litters, eq, sql } from '@homeforpup/database';
import { Kennel, UpdateKennelRequest, KennelResponse } from '@homeforpup/shared-types';

import { auth } from '@clerk/nextjs/server';

// GET /api/kennels/[id] - Get kennel details with dogs and litters
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;

    // Get kennel
    const [kennel] = await db.select().from(kennels).where(eq(kennels.id, kennelId)).limit(1);

    if (!kennel) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Check if user has access to this kennel
    const owners = (kennel.owners as string[]) || [];
    const managers = (kennel.managers as string[]) || [];
    if (!owners.includes(userId) && !managers.includes(userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get dogs in this kennel
    const kennelDogs = await db.select().from(dogs).where(eq(dogs.kennelId, kennelId));

    // Get litters in this kennel
    const kennelLitters = await db.select().from(litters).where(eq(litters.kennelId, kennelId));

    // Calculate stats
    const stats = {
      totalDogs: kennelDogs.length,
      totalLitters: kennelLitters.length,
      totalPuppies: kennelLitters.reduce((sum, litter) => sum + ((litter as any).actualPuppyCount || 0), 0),
      activeBreedingDogs: kennelDogs.filter(dog =>
        dog.dogType === 'parent' &&
        (dog.breeding as any)?.isBreedingDog &&
        (dog.breeding as any)?.breedingStatus === 'available'
      ).length,
    };

    const response: KennelResponse = {
      kennel: kennel as any,
      dogs: kennelDogs as any[],
      litters: kennelLitters as any[],
      stats,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/kennels/[id] - Update kennel
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;
    const body: UpdateKennelRequest = await request.json();

    console.log('Received update request for kennel:', kennelId);
    console.log('Request body:', body);
    console.log('Facilities in request:', body.facilities);
    console.log('Specialties in request:', body.specialties);
    console.log('Specialties type:', typeof body.specialties);
    console.log('Is specialties array:', Array.isArray(body.specialties));

    // Get existing kennel
    const [existingKennel] = await db.select().from(kennels).where(eq(kennels.id, kennelId)).limit(1);

    if (!existingKennel) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Check if user has permission to update
    const owners = (existingKennel.owners as string[]) || [];
    const managers = (existingKennel.managers as string[]) || [];
    if (!owners.includes(userId) && !managers.includes(userId)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: new Date().toISOString(),
    };

    const fieldsToUpdate = [
      'name', 'description', 'businessName', 'website', 'phone', 'email',
      'address', 'facilities', 'capacity', 'specialties', 'socialMedia'
    ];

    fieldsToUpdate.forEach(field => {
      if (body[field as keyof UpdateKennelRequest] !== undefined) {
        updateData[field] = body[field as keyof UpdateKennelRequest];
      }
    });

    console.log('Update data:', updateData);

    const [updatedKennel] = await db.update(kennels)
      .set(updateData)
      .where(eq(kennels.id, kennelId))
      .returning();

    console.log('Updated kennel:', updatedKennel);
    console.log('Updated facilities:', updatedKennel?.facilities);
    console.log('Facilities type:', typeof updatedKennel?.facilities);
    console.log('Is facilities object:', updatedKennel?.facilities && typeof updatedKennel?.facilities === 'object');

    return NextResponse.json({ kennel: updatedKennel });
  } catch (error) {
    console.error('Error updating kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE /api/kennels/[id] - Delete kennel
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: kennelId } = await params;

    // Get existing kennel
    const [existingKennel] = await db.select().from(kennels).where(eq(kennels.id, kennelId)).limit(1);

    if (!existingKennel) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Check if user is the owner (only owners can delete)
    const owners = (existingKennel.owners as string[]) || [];
    if (!owners.includes(userId)) {
      return NextResponse.json({ error: 'Only kennel owners can delete kennels' }, { status: 403 });
    }

    // Check if kennel has dogs
    const kennelDogs = await db.select({ id: dogs.id }).from(dogs).where(eq(dogs.kennelId, kennelId)).limit(1);
    if (kennelDogs.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete kennel with existing dogs. Please remove all dogs first.'
      }, { status: 400 });
    }

    // Check if kennel has litters
    const kennelLitters = await db.select({ id: litters.id }).from(litters).where(eq(litters.kennelId, kennelId)).limit(1);
    if (kennelLitters.length > 0) {
      return NextResponse.json({
        error: 'Cannot delete kennel with existing litters. Please remove all litters first.'
      }, { status: 400 });
    }

    // Delete kennel
    await db.delete(kennels).where(eq(kennels.id, kennelId));

    return NextResponse.json({ message: 'Kennel deleted successfully' });
  } catch (error) {
    console.error('Error deleting kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
