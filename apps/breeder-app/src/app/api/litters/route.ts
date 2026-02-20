import { NextRequest, NextResponse } from 'next/server';
import { db, kennels, dogs, litters, eq, and, or, sql, inArray } from '@homeforpup/database';
import { CreateLitterRequest, LittersResponse, LitterFilter } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { checkLitterCreationAllowed } from '@/lib/stripe/subscriptionGuard';

import { auth } from '@clerk/nextjs/server';

// GET /api/litters - List litters with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const kennelId = searchParams.get('kennelId') || '';
    const status = searchParams.get('status') || '';
    const breed = searchParams.get('breed') || '';
    const startDate = searchParams.get('startDate') || '';
    const endDate = searchParams.get('endDate') || '';

    // Build where conditions
    const conditions: any[] = [];

    // Filter by user's litters (breeder_id = userId)
    conditions.push(eq(litters.breederId, userId));

    if (search) {
      conditions.push(
        or(
          sql`${litters.name} ILIKE ${'%' + search + '%'}`,
          sql`${litters.sireName} ILIKE ${'%' + search + '%'}`,
          sql`${litters.damName} ILIKE ${'%' + search + '%'}`
        )
      );
    }

    if (kennelId) {
      conditions.push(eq(litters.kennelId, kennelId));
    }

    if (status) {
      conditions.push(eq(litters.status, status));
    }

    if (breed) {
      conditions.push(eq(litters.breed, breed));
    }

    if (startDate) {
      conditions.push(sql`${litters.birthDate} >= ${startDate}`);
    }

    if (endDate) {
      conditions.push(sql`${litters.birthDate} <= ${endDate}`);
    }

    const allLitters = await db.select().from(litters).where(and(...conditions));

    // Sort by birthDate descending
    allLitters.sort((a, b) => new Date(b.birthDate || '').getTime() - new Date(a.birthDate || '').getTime());

    const response: LittersResponse = {
      litters: allLitters.slice(offset, offset + limit) as any[],
      total: allLitters.length,
      hasMore: allLitters.length > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching litters:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/litters - Create new litter
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription limits
    const guard = await checkLitterCreationAllowed(userId);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: 'Subscription limit reached', message: guard.reason, tier: guard.tier, currentCount: guard.currentCount, limit: guard.limit },
        { status: 403 }
      );
    }

    const body: CreateLitterRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.kennelId || !body.sireId || !body.damId) {
      return NextResponse.json(
        { error: 'Missing required fields: name, kennelId, sireId, damId' },
        { status: 400 }
      );
    }

    // Verify user has access to the kennel
    const [kennel] = await db.select().from(kennels).where(eq(kennels.id, body.kennelId)).limit(1);

    if (!kennel) {
      return NextResponse.json({ error: 'Kennel not found or access denied' }, { status: 404 });
    }

    const kennelOwners = (kennel.owners as string[]) || [];
    const kennelManagers = (kennel.managers as string[]) || [];
    if (!kennelOwners.includes(userId) && !kennelManagers.includes(userId)) {
      return NextResponse.json({ error: 'Kennel not found or access denied' }, { status: 404 });
    }

    // Verify sire and dam exist and belong to the kennel
    const parentDogs = await db.select().from(dogs).where(
      and(
        inArray(dogs.id, [body.sireId, body.damId]),
        eq(dogs.kennelId, body.kennelId)
      )
    );

    if (parentDogs.length !== 2) {
      return NextResponse.json({ error: 'Sire and dam must exist and belong to the kennel' }, { status: 400 });
    }

    const sire = parentDogs.find(dog => dog.id === body.sireId);
    const dam = parentDogs.find(dog => dog.id === body.damId);

    if (!sire || !dam) {
      return NextResponse.json({ error: 'Sire and dam not found' }, { status: 404 });
    }

    if (sire.gender !== 'male' || dam.gender !== 'female') {
      return NextResponse.json({ error: 'Sire must be male and dam must be female' }, { status: 400 });
    }

    const litterId = uuidv4();
    const timestamp = new Date().toISOString();

    const litter: any = {
      id: litterId,
      breederId: userId,
      name: body.name,
      kennelId: body.kennelId,
      sireId: body.sireId,
      sireName: sire.name,
      damId: body.damId,
      damName: dam.name,
      breed: sire.breed,
      birthDate: body.expectedBirthDate || new Date().toISOString(),
      expectedPuppyCount: body.expectedPuppyCount,
      actualPuppyCount: 0,
      puppies: [],
      status: body.expectedBirthDate ? 'expected' : 'born',
      health: {
        whelpingComplications: undefined,
        vetCheckDate: undefined,
        vetNotes: undefined,
        vaccinationsStarted: false,
        dewormingStarted: false,
      },
      createdAt: timestamp,
      updatedAt: timestamp,
      notes: body.notes,
    };

    await db.insert(litters).values(litter);

    return NextResponse.json({ litter }, { status: 201 });
  } catch (error) {
    console.error('Error creating litter:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
