import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, favorites, eq, and, desc } from '@homeforpup/database';

// GET /api/favorites - Get user's favorites
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.select().from(favorites)
      .where(eq(favorites.userId, userId))
      .orderBy(desc(favorites.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      favorites: result,
      lastKey: null,
      count: result.length
    });

  } catch (error) {
    console.error('Error fetching favorites:', error);
    return NextResponse.json(
      { error: 'Failed to fetch favorites' },
      { status: 500 }
    );
  }
}

// POST /api/favorites - Add a puppy to favorites
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { puppyId, puppyData } = await request.json();

    if (!puppyId) {
      return NextResponse.json({ error: 'Puppy ID is required' }, { status: 400 });
    }

    const favoriteItem = {
      userId,
      puppyId,
      createdAt: new Date().toISOString(),
      puppyData: puppyData || null
    };

    await db.insert(favorites).values(favoriteItem);

    return NextResponse.json({
      message: 'Added to favorites',
      favorite: favoriteItem
    });

  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json(
      { error: 'Failed to add to favorites' },
      { status: 500 }
    );
  }
}

// DELETE /api/favorites - Remove a puppy from favorites
export async function DELETE(request: NextRequest) {
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

    await db.delete(favorites).where(
      and(eq(favorites.userId, userId), eq(favorites.puppyId, puppyId))
    );

    return NextResponse.json({
      message: 'Removed from favorites'
    });

  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json(
      { error: 'Failed to remove from favorites' },
      { status: 500 }
    );
  }
}
