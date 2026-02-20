import { NextRequest, NextResponse } from 'next/server';
import { db, kennels, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search');
    const state = searchParams.get('state');
    const specialty = searchParams.get('specialty');
    const verified = searchParams.get('verified');
    const hasAvailability = searchParams.get('hasAvailability');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    // Query for active kennels
    let allKennels = await db.select().from(kennels)
      .where(eq(kennels.status, 'active'));

    let kennelsList = allKennels as any[];

    // Build filter metadata from full (unfiltered) dataset
    const allStates = new Set<string>();
    const allSpecialties = new Set<string>();
    let verifiedCount = 0;

    for (const kennel of kennelsList) {
      if (kennel.address?.state) allStates.add(kennel.address.state);
      if (kennel.specialties) {
        for (const s of kennel.specialties) allSpecialties.add(s);
      }
      if (kennel.verified) verifiedCount++;
    }

    // Client-side search filter
    if (search && search.trim()) {
      const searchLower = search.trim().toLowerCase();
      kennelsList = kennelsList.filter((kennel: any) =>
        (kennel.name || '').toLowerCase().includes(searchLower) ||
        (kennel.businessName || '').toLowerCase().includes(searchLower) ||
        (kennel.specialties || []).some((s: string) => s.toLowerCase().includes(searchLower))
      );
    }

    // Client-side filters
    if (state) {
      kennelsList = kennelsList.filter((kennel: any) => kennel.address?.state === state);
    }

    if (specialty) {
      const specLower = specialty.toLowerCase();
      kennelsList = kennelsList.filter((kennel: any) =>
        (kennel.specialties || []).some((s: string) => s.toLowerCase() === specLower)
      );
    }

    if (verified === 'true') {
      kennelsList = kennelsList.filter((kennel: any) => kennel.verified === true);
    }

    if (hasAvailability === 'true') {
      kennelsList = kennelsList.filter((kennel: any) =>
        kennel.capacity?.currentDogs != null &&
        kennel.capacity?.maxDogs != null &&
        kennel.capacity.currentDogs < kennel.capacity.maxDogs
      );
    }

    // Strip sensitive fields before returning
    kennelsList = kennelsList.map(({ owners, managers, createdBy, ...rest }: any) => rest);

    // Client-side pagination
    const total = kennelsList.length;
    const startIndex = (page - 1) * limit;
    const paginatedKennels = kennelsList.slice(startIndex, startIndex + limit);

    return NextResponse.json({
      kennels: paginatedKennels,
      total,
      page,
      limit,
      hasMore: startIndex + limit < total,
      filters: {
        availableStates: Array.from(allStates).sort(),
        availableSpecialties: Array.from(allSpecialties).sort(),
        verifiedCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching kennels:', error);

    return NextResponse.json(
      {
        message: 'Error fetching kennels',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
