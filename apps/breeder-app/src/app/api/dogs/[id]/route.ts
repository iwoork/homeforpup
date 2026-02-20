import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';
import { checkDogAccess } from '@/lib/auth/kennelAccess';

import { auth } from '@clerk/nextjs/server';
// GET /api/dogs/[id] - Get dog details
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
    const dog = await dogsApiClient.getDogById(dogId);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has access to this dog (owns it or manages the kennel)
    console.log('GET /api/dogs/[id] - Access check:');
    console.log('- Dog ID:', dogId);
    console.log('- Dog ownerId:', dog.ownerId);
    console.log('- Session user ID:', userId);
    console.log('- Dog kennelId:', dog.kennelId);
    
    const accessResult = await checkDogAccess(userId, dog);
    console.log('- Access result:', accessResult);
    
    if (!accessResult.hasAccess) {
      console.log('Access denied: No direct ownership or kennel access');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    console.log(`Access granted via ${accessResult.accessType}${accessResult.kennelName ? ` (${accessResult.kennelName})` : ''}`);

    return NextResponse.json({ dog });
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    
    // First check if dog exists and user has access
    const existingDog = await dogsApiClient.getDogById(dogId);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const accessResult = await checkDogAccess(userId, existingDog);
    if (!accessResult.hasAccess) {
      console.log('PUT - Access denied: No direct ownership or kennel access');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    console.log(`PUT - Access granted via ${accessResult.accessType}${accessResult.kennelName ? ` (${accessResult.kennelName})` : ''}`);

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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    
    // First check if dog exists and user has access
    const existingDog = await dogsApiClient.getDogById(dogId);
    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    const accessResult = await checkDogAccess(userId, existingDog);
    if (!accessResult.hasAccess) {
      console.log('DELETE - Access denied: No direct ownership or kennel access');
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }
    
    console.log(`DELETE - Access granted via ${accessResult.accessType}${accessResult.kennelName ? ` (${accessResult.kennelName})` : ''}`);

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