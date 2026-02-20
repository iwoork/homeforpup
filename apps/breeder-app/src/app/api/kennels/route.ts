import { NextRequest, NextResponse } from 'next/server';
import { db, kennels, eq, and, or, sql } from '@homeforpup/database';
import { CreateKennelRequest, KennelsResponse } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';
import { checkKennelCreationAllowed } from '@/lib/stripe/subscriptionGuard';
import { auth } from '@clerk/nextjs/server';

// GET /api/kennels - List kennels with filtering
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      console.error('Kennels API - Unauthorized: No valid authentication');
      return NextResponse.json({
        error: 'Unauthorized',
        message: 'Please ensure you are logged in. If this issue persists, try logging out and logging back in.',
      }, { status: 401 });
    }

    console.log('Kennels API - Authenticated user:', userId);

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const verified = searchParams.get('verified');
    const specialty = searchParams.get('specialty') || '';
    const city = searchParams.get('city') || '';
    const state = searchParams.get('state') || '';

    // Build where conditions
    const conditions: any[] = [];

    // Filter by user's kennels (owners or managers) using jsonb @> operator
    conditions.push(
      or(
        sql`${kennels.owners}::jsonb @> ${JSON.stringify([userId])}::jsonb`,
        sql`${kennels.managers}::jsonb @> ${JSON.stringify([userId])}::jsonb`
      )
    );

    if (search) {
      conditions.push(
        or(
          sql`${kennels.name} ILIKE ${'%' + search + '%'}`,
          sql`${kennels.description} ILIKE ${'%' + search + '%'}`,
          sql`${kennels.businessName} ILIKE ${'%' + search + '%'}`
        )
      );
    }

    if (status) {
      conditions.push(eq(kennels.status, status));
    }

    if (verified !== null && verified !== undefined) {
      conditions.push(eq(kennels.verified, verified === 'true'));
    }

    if (specialty) {
      conditions.push(sql`${kennels.specialties}::jsonb @> ${JSON.stringify([specialty])}::jsonb`);
    }

    if (city) {
      conditions.push(sql`${kennels.address}->>'city' = ${city}`);
    }

    if (state) {
      conditions.push(sql`${kennels.address}->>'state' = ${state}`);
    }

    const allKennels = await db.select().from(kennels).where(and(...conditions));

    // Sort by updatedAt descending
    allKennels.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());

    const response: KennelsResponse = {
      kennels: allKennels.slice(offset, offset + limit) as any[],
      total: allKennels.length,
      hasMore: allKennels.length > offset + limit,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching kennels:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/kennels - Create new kennel
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check subscription limits
    const guard = await checkKennelCreationAllowed(userId);
    if (!guard.allowed) {
      return NextResponse.json(
        { error: 'Subscription limit reached', message: guard.reason, tier: guard.tier, currentCount: guard.currentCount, limit: guard.limit },
        { status: 403 }
      );
    }

    const body: CreateKennelRequest = await request.json();

    // Validate required fields
    if (!body.name || !body.address) {
      return NextResponse.json(
        { error: 'Missing required fields: name, address' },
        { status: 400 }
      );
    }

    const kennelId = uuidv4();
    const timestamp = new Date().toISOString();

    const kennel: any = {
      id: kennelId,
      name: body.name,
      description: body.description,
      businessName: body.businessName,
      website: body.website,
      phone: body.phone,
      email: body.email,
      address: body.address,
      facilities: body.facilities || {
        indoorSpace: false,
        outdoorSpace: false,
        exerciseArea: false,
        whelpingArea: false,
        quarantineArea: false,
        groomingArea: false,
        veterinaryAccess: false,
        climateControl: false,
        security: false,
        other: [],
      },
      capacity: body.capacity || {
        maxDogs: 10,
        maxLitters: 5,
        currentDogs: 0,
        currentLitters: 0,
      },
      owners: [userId],
      managers: [userId],
      createdBy: userId,
      status: 'active',
      verified: false,
      createdAt: timestamp,
      updatedAt: timestamp,
      photos: [],
      videos: [],
      specialties: body.specialties || [],
      socialMedia: body.socialMedia,
    };

    await db.insert(kennels).values(kennel);

    return NextResponse.json({ kennel }, { status: 201 });
  } catch (error) {
    console.error('Error creating kennel:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
