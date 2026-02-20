import { NextRequest, NextResponse } from 'next/server';
import { dogsApiClient } from '@homeforpup/shared-dogs';

import { auth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await dogsApiClient.getMatchedDogs(userId);
    
    // Return the matched puppies array for backward compatibility
    return NextResponse.json(data.matchedPuppies);
  } catch (error) {
    console.error('Error fetching matched puppies:', error);
    return NextResponse.json(
      { 
        message: 'Error fetching matched puppies',
        error: process.env.NODE_ENV === 'development' ? String(error) : 'Internal server error'
      },
      { status: 500 }
    );
  }
}