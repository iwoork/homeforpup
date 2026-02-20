import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq, and, sql } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';
// GET /api/dogs - Get all dogs for the authenticated user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const typeParam = searchParams.get('type') || '';
    const genderParam = searchParams.get('gender') || '';
    const breedingStatusParam = searchParams.get('breedingStatus') || '';

    const options = {
      ownerId: userId, // Filter by owner for dog parent app
      search: searchParams.get('search') || '',
      kennelId: searchParams.get('kennelId') || '',
      type: (typeParam === 'parent' || typeParam === 'puppy') ? typeParam : undefined,
      gender: (genderParam === 'male' || genderParam === 'female') ? genderParam : undefined,
      breed: searchParams.get('breed') || '',
      status: searchParams.get('status') || '',
      breedingStatus: (breedingStatusParam === 'available' || breedingStatusParam === 'retired' || breedingStatusParam === 'not_ready') ? breedingStatusParam : undefined,
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
      offset: parseInt(searchParams.get('offset') || '0'),
      sortBy: searchParams.get('sortBy') || 'updatedAt'
    };

    // Build conditions
    const conditions: any[] = [];

    if (options.ownerId) conditions.push(eq(dogs.ownerId, options.ownerId));
    if (options.search) {
      conditions.push(
        sql`(${dogs.name} ILIKE ${'%' + options.search + '%'} OR ${dogs.callName} ILIKE ${'%' + options.search + '%'} OR ${dogs.breed} ILIKE ${'%' + options.search + '%'})`
      );
    }
    if (options.kennelId) conditions.push(eq(dogs.kennelId, options.kennelId));
    if (options.type) conditions.push(eq(dogs.dogType, options.type));
    if (options.gender) conditions.push(eq(dogs.gender, options.gender));
    if (options.breed) conditions.push(eq(dogs.breed, options.breed));
    if (options.status) conditions.push(eq(dogs.status, options.status));
    if (options.breedingStatus) conditions.push(eq(dogs.breedingStatus, options.breedingStatus));

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;
    const allDogs = await db.select().from(dogs).where(whereClause);

    // Apply sorting in JS
    const sortedDogs = [...allDogs];
    switch (options.sortBy) {
      case 'name':
        sortedDogs.sort((a, b) => a.name.localeCompare(b.name)); break;
      case 'breed':
        sortedDogs.sort((a, b) => a.breed.localeCompare(b.breed) || a.name.localeCompare(b.name)); break;
      case 'birthDate':
        sortedDogs.sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime()); break;
      case 'updatedAt':
      default:
        sortedDogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()); break;
    }

    // Apply pagination
    const startIndex = options.offset || (options.page - 1) * options.limit;
    const endIndex = startIndex + options.limit;
    const paginatedDogs = sortedDogs.slice(startIndex, endIndex);

    // For dog parent app, return just the dogs array for backward compatibility
    return NextResponse.json(paginatedDogs);
  } catch (error) {
    console.error('Error fetching dogs:', error);
    return NextResponse.json(
      {
        message: 'Error fetching dogs',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}

// POST /api/dogs - Create a new dog
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const now = new Date().toISOString();
    const dogData = {
      id: uuidv4(),
      ownerId: userId,
      ...body,
      weight: body.weight || 0,
      description: body.description || '',
      dogType: body.dogType || 'puppy',
      healthTests: [],
      breedingStatus: body.breedingStatus || 'not_ready',
      healthStatus: body.healthStatus || 'good',
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(dogs).values(dogData);

    return NextResponse.json(dogData, { status: 201 });
  } catch (error) {
    console.error('Error creating dog:', error);
    return NextResponse.json(
      {
        message: 'Error creating dog',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}
