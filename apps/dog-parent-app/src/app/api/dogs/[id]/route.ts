import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';
// GET /api/dogs/[id] - Get dog details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await context.params;
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // For adopter app, allow viewing any dog (public access)
    // Or check if user owns this dog
    if (dog.ownerId !== userId) {
      // Allow public access for adopters to view available dogs
      // You might want to filter sensitive information here
    }

    return NextResponse.json(dog);
  } catch (error) {
    console.error('Error fetching dog:', error);
    return NextResponse.json(
      {
        message: 'Error fetching dog',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// PUT /api/dogs/[id] - Update dog
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await context.params;

    // First check if dog exists and user has access
    const [existingDog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    if (existingDog.ownerId !== userId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const [updatedDog] = await db
      .update(dogs)
      .set({ ...body, updatedAt: new Date().toISOString() })
      .where(eq(dogs.id, dogId))
      .returning();

    return NextResponse.json(updatedDog);
  } catch (error) {
    console.error('Error updating dog:', error);
    return NextResponse.json(
      {
        message: 'Error updating dog',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
