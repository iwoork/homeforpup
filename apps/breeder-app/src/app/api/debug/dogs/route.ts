import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';

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
    
    const dogsResult = await dogsApiClient.getDogs({
      limit: 100 // Get more dogs to see if any exist
    }, userId);

    console.log('Debug: Dogs API result:', {
      totalDogs: dogsResult.total,
      returnedDogs: dogsResult.dogs.length,
      firstDogId: dogsResult.dogs[0]?.id,
      firstDogOwner: dogsResult.dogs[0]?.ownerId
    });

    return NextResponse.json({
      ...debugInfo,
      dogsApiResult: {
        total: dogsResult.total,
        count: dogsResult.count,
        dogsReturned: dogsResult.dogs.length,
        dogs: dogsResult.dogs.map(dog => ({
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
