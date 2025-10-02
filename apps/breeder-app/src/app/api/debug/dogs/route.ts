import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dogsApiClient } from '@homeforpup/shared-dogs';

// Debug endpoint to help troubleshoot dogs API issues
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    const debugInfo = {
      timestamp: new Date().toISOString(),
      sessionExists: !!session,
      userId: session?.user?.id || null,
      userEmail: session?.user?.email || null,
    };

    if (!session?.user?.id) {
      return NextResponse.json({
        ...debugInfo,
        error: 'No session or user ID found',
        suggestion: 'Make sure you are logged in'
      });
    }

    // Test the dogs API with minimal options
    console.log('Debug: Testing dogs API for user:', session.user.id);
    
    const dogsResult = await dogsApiClient.getDogs({
      limit: 100 // Get more dogs to see if any exist
    }, session.user.id);

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
        userId: session.user.id,
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
