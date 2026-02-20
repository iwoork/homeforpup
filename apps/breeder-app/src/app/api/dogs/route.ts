import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';
import { getUserAccessibleDogs } from '@/lib/auth/kennelAccess';
import { checkDogCreationAllowed } from '@/lib/stripe/subscriptionGuard';

import { auth } from '@clerk/nextjs/server';
// GET /api/dogs - List dogs with filtering
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

    // Use kennel-based access instead of the shared API
    const data = await getUserAccessibleDogs(userId, options);
    return NextResponse.json(data);
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

    // Check subscription limits for parent dogs
    if (body.dogType === 'parent') {
      const guard = await checkDogCreationAllowed(userId);
      if (!guard.allowed) {
        return NextResponse.json(
          { error: 'Subscription limit reached', message: guard.reason, tier: guard.tier, currentCount: guard.currentCount, limit: guard.limit },
          { status: 403 }
        );
      }
    }

    const dog = await dogsApiClient.createDog(body, userId);
    
    return NextResponse.json(dog, { status: 201 });
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