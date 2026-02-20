import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';

import { auth } from '@clerk/nextjs/server';
// GET /api/dogs/[id] - Get dog details
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await context.params;
    const dog = await dogsApiClient.getDogById(dogId);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // For adopter app, allow viewing any dog (public access)
    // Or check if user owns this dog
    if (dog.ownerId !== userId) {
      // Allow public access for adopters to view available dogs
      // You might want to filter sensitive information here
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
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await context.params;
    
    // First check if dog exists and user has access
    const existingDog = await dogsApiClient.getDogById(dogId);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    if (existingDog.ownerId !== userId) {
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
