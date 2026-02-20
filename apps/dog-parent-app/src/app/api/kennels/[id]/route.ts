import { NextRequest, NextResponse } from 'next/server';
import { db, kennels, dogs, litters, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: kennelId } = await params;

    // Get kennel by id
    const [kennel] = await db.select().from(kennels)
      .where(eq(kennels.id, kennelId))
      .limit(1);

    if (!kennel) {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Only show active kennels
    if (kennel.status !== 'active') {
      return NextResponse.json({ error: 'Kennel not found' }, { status: 404 });
    }

    // Get dogs for this kennel
    const allDogs = await db.select().from(dogs)
      .where(eq(dogs.kennelId, kennelId));

    // Filter to parent dogs only (puppies are embedded in litters)
    const parentDogs = allDogs.filter(
      (dog: any) => dog.dogType === 'parent'
    );

    // Get litters for this kennel
    const littersList = await db.select().from(litters)
      .where(eq(litters.kennelId, kennelId));

    // Calculate stats
    const stats = {
      totalDogs: parentDogs.length,
      totalLitters: littersList.length,
      totalPuppies: littersList.reduce(
        (sum: number, litter: any) => sum + (litter.actualPuppyCount || litter.puppies?.length || 0),
        0
      ),
      activeBreedingDogs: parentDogs.filter(
        (dog: any) =>
          dog.breeding?.isBreedingDog && dog.breeding?.breedingStatus === 'available'
      ).length,
    };

    // Strip sensitive fields from kennel
    const { owners, managers, createdBy, ...safeKennel } = kennel as any;

    // Strip sensitive fields from dogs
    const safeDogs = parentDogs.map(({ ownerId, ...rest }: any) => rest);

    return NextResponse.json({
      kennel: safeKennel,
      dogs: safeDogs,
      litters: littersList,
      stats,
    });
  } catch (error: any) {
    console.error('Error fetching kennel:', error);

    return NextResponse.json(
      {
        message: 'Error fetching kennel',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
