import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';
// Debug endpoint to help troubleshoot dogs API issues
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();

    const debugInfo = {
      timestamp: new Date().toISOString(),
      authenticated: !!userId,
      userId: userId || null,
    };

    if (!userId) {
      return NextResponse.json({
        ...debugInfo,
        error: 'No session or user ID found',
        suggestion: 'Make sure you are logged in'
      });
    }

    // Test the dogs API with minimal options
    console.log('Debug: Testing dogs API for user:', userId);

    const allDogs = await db
      .select()
      .from(dogs)
      .where(eq(dogs.ownerId, userId));

    // Sort by updatedAt descending (mimics old default) and limit to 100
    allDogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    const limitedDogs = allDogs.slice(0, 100);
    const total = allDogs.length;

    console.log('Debug: Dogs API result:', {
      totalDogs: total,
      returnedDogs: limitedDogs.length,
      firstDogId: limitedDogs[0]?.id,
      firstDogOwner: limitedDogs[0]?.ownerId
    });

    return NextResponse.json({
      ...debugInfo,
      dogsApiResult: {
        total,
        count: limitedDogs.length,
        dogsReturned: limitedDogs.length,
        dogs: limitedDogs.map(dog => ({
          id: dog.id,
          name: dog.name,
          ownerId: dog.ownerId,
          breed: dog.breed,
          createdAt: dog.createdAt
        }))
      },
      rawApiParams: {
        userId: userId,
        limit: 100
      }
    });

  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json({
      error: 'Debug endpoint failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: process.env.NODE_ENV === 'development' ? (error instanceof Error ? error.stack : null) : null
    }, { status: 500 });
  }
}
