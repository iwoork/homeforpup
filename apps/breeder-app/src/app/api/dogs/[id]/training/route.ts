import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { TrainingRecord } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// POST /api/dogs/[id]/training - Add training record
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

    // Create new training record
    const trainingId = uuidv4();
    const timestamp = new Date().toISOString();

    const newTraining: TrainingRecord = {
      id: trainingId,
      dogId: dogId,
      sessionDate: body.sessionDate,
      trainer: body.trainer ? {
        name: body.trainer.name,
        credentials: body.trainer.credentials,
        contact: body.trainer.contact,
      } : undefined,
      trainingType: body.trainingType,
      customTrainingType: body.customTrainingType,
      skills: body.skills || [],
      duration: body.duration,
      location: body.location,
      notes: body.notes,
      progress: body.progress,
      nextSessionDate: body.nextSessionDate,
      attachments: body.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update dog with new training record
    const existingTraining = (existingDog.trainingRecords as any[]) || [];
    const updatedTraining = [...existingTraining, newTraining];

    await db.update(dogs)
      .set({ trainingRecords: updatedTraining, updatedAt: timestamp })
      .where(eq(dogs.id, dogId));

    return NextResponse.json({ training: newTraining }, { status: 201 });
  } catch (error) {
    console.error('Error adding training record:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/training - Get training records for dog
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

    const trainingRecords = (dog.trainingRecords as any[]) || [];

    return NextResponse.json({ trainingRecords });
  } catch (error) {
    console.error('Error fetching training records:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
