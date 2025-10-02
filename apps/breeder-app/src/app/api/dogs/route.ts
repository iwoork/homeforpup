import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dogsApiClient } from '@homeforpup/shared-dogs';

// GET /api/dogs - List dogs with filtering
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
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

    const data = await dogsApiClient.getDogs(options, session.user.id);
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
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const dog = await dogsApiClient.createDog(body, session.user.id);
    
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