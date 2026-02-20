import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { VeterinaryVisit } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// POST /api/dogs/[id]/vet-visits - Add vet visit
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

    // Create new vet visit
    const vetVisitId = uuidv4();
    const timestamp = new Date().toISOString();

    const newVetVisit: VeterinaryVisit = {
      id: vetVisitId,
      dogId: dogId,
      visitDate: body.visitDate,
      veterinarian: {
        name: body.veterinarian.name,
        clinic: body.veterinarian.clinic,
        phone: body.veterinarian.phone,
        email: body.veterinarian.email,
      },
      visitType: body.visitType,
      reason: body.reason,
      diagnosis: body.diagnosis,
      treatment: body.treatment,
      medications: body.medications || [],
      weight: body.weight,
      temperature: body.temperature,
      heartRate: body.heartRate,
      notes: body.notes,
      followUpRequired: body.followUpRequired || false,
      followUpDate: body.followUpDate,
      cost: body.cost,
      attachments: body.attachments || [],
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Update dog with new vet visit
    const existingVetVisits = (existingDog.veterinaryVisits as any[]) || [];
    const updatedVetVisits = [...existingVetVisits, newVetVisit];

    await db.update(dogs)
      .set({ veterinaryVisits: updatedVetVisits, updatedAt: timestamp })
      .where(eq(dogs.id, dogId));

    return NextResponse.json({ vetVisit: newVetVisit }, { status: 201 });
  } catch (error) {
    console.error('Error adding vet visit:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/vet-visits - Get vet visits for dog
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

    const vetVisits = (dog.veterinaryVisits as any[]) || [];

    return NextResponse.json({ vetVisits });
  } catch (error) {
    console.error('Error fetching vet visits:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
