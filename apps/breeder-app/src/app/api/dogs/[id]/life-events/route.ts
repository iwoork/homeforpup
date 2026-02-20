import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { LifeEvent } from '@homeforpup/shared-types/kennel';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// POST /api/dogs/[id]/life-events - Add life event
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const body = await request.json();

    // Get existing dog
    const [existingDog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has permission
    const access = await checkDogAccess(userId, existingDog as any);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new life event
    const lifeEventId = uuidv4();
    const timestamp = new Date().toISOString();

    const newLifeEvent: LifeEvent = {
      id: lifeEventId,
      dogId: dogId,
      eventType: body.eventType,
      eventDate: body.eventDate,
      title: body.title,
      description: body.description,
      notes: body.notes,
      attachments: body.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update dog with new life event
    const existingLifeEvents = (existingDog.lifeEvents as any[]) || [];
    const updatedLifeEvents = [...existingLifeEvents, newLifeEvent];

    await db.update(dogs)
      .set({ lifeEvents: updatedLifeEvents, updatedAt: timestamp })
      .where(eq(dogs.id, dogId));

    return NextResponse.json({ lifeEvent: newLifeEvent }, { status: 201 });
  } catch (error) {
    console.error('Error adding life event:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/life-events - Get life events for dog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;

    const [dog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has access
    const access = await checkDogAccess(userId, dog as any);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const lifeEvents = (dog.lifeEvents as any[]) || [];

    return NextResponse.json({ lifeEvents });
  } catch (error) {
    console.error('Error fetching life events:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
