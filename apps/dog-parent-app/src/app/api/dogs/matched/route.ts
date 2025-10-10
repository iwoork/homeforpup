import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { dogsApiClient } from '@homeforpup/shared-dogs';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await dogsApiClient.getMatchedDogs(session.user.id);
    
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