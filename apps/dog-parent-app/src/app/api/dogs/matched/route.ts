import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, profiles, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch user profile to get preferences
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json([]);
    }

    const userCriteria = user.puppyParentInfo || {};

    if (!userCriteria.preferredBreeds || userCriteria.preferredBreeds.length === 0) {
      return NextResponse.json([]);
    }

    // Fetch available dogs
    const availableDogs = await db
      .select()
      .from(dogs)
      .where(eq(dogs.breedingStatus, 'available'));

    // Filter by preferred breeds
    const matchedPuppies = availableDogs.filter((dog) => {
      if (userCriteria.preferredBreeds && !userCriteria.preferredBreeds.includes(dog.breed)) {
        return false;
      }
      return true;
    });

    // Sort by newest first
    matchedPuppies.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    // Return the matched puppies array for backward compatibility
    return NextResponse.json(matchedPuppies);
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
