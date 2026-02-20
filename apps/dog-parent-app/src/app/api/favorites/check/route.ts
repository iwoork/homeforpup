import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, favorites, eq, and, inArray } from '@homeforpup/database';

// GET /api/favorites/check - Check if a puppy is favorited by the user
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const puppyId = searchParams.get('puppyId');

    if (!puppyId) {
      return NextResponse.json({ error: 'Puppy ID is required' }, { status: 400 });
    }

    const [result] = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), eq(favorites.puppyId, puppyId)))
      .limit(1);

    return NextResponse.json({
      isFavorited: !!result,
      favorite: result || null
    });

  } catch (error) {
    console.error('Error checking favorite status:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite status' },
      { status: 500 }
    );
  }
}

// POST /api/favorites/check - Check multiple puppies at once
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { puppyIds } = await request.json();

    if (!Array.isArray(puppyIds)) {
      return NextResponse.json({ error: 'Puppy IDs must be an array' }, { status: 400 });
    }

    if (puppyIds.length === 0) {
      return NextResponse.json({ favoriteStatus: {}, results: [] });
    }

    // Batch query all favorites for this user with given puppyIds
    const results = await db.select().from(favorites)
      .where(and(eq(favorites.userId, userId), inArray(favorites.puppyId, puppyIds)));

    const favoritedPuppyIds = new Set(results.map(r => r.puppyId));

    // Build response
    const detailedResults = puppyIds.map((puppyId: string) => {
      const fav = results.find(r => r.puppyId === puppyId);
      return {
        puppyId,
        isFavorited: favoritedPuppyIds.has(puppyId),
        favorite: fav || null
      };
    });

    const favoriteStatus = detailedResults.reduce((acc, result) => {
      acc[result.puppyId] = result.isFavorited;
      return acc;
    }, {} as Record<string, boolean>);

    return NextResponse.json({
      favoriteStatus,
      results: detailedResults
    });

  } catch (error) {
    console.error('Error checking favorite statuses:', error);
    return NextResponse.json(
      { error: 'Failed to check favorite statuses' },
      { status: 500 }
    );
  }
}
