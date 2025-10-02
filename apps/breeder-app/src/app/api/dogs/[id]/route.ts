import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dogsApiClient } from '@homeforpup/shared-dogs';

// GET /api/dogs/[id] - Get dog details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const dog = await dogsApiClient.getDogById(dogId);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has access to this dog (owns it or manages the kennel)
    if (dog.ownerId !== session.user.id) {
      // TODO: Add kennel ownership check
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    
    // First check if dog exists and user has access
    const existingDog = await dogsApiClient.getDogById(dogId);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    if (existingDog.ownerId !== session.user.id) {
      // TODO: Add kennel ownership check
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const updatedDog = await dogsApiClient.updateDog({ id: dogId, ...body });
    
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

// DELETE /api/dogs/[id] - Delete dog
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    
    // First check if dog exists and user has access
    const existingDog = await dogsApiClient.getDogById(dogId);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    if (existingDog.ownerId !== session.user.id) {
      // TODO: Add kennel ownership check
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    await dogsApiClient.deleteDog(dogId);
    
    return NextResponse.json({ message: 'Dog deleted successfully' });
  } catch (error) {
    console.error('Error deleting dog:', error);
    return NextResponse.json(
      { 
        message: 'Error deleting dog',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}