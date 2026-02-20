import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, reviews, eq, desc } from '@homeforpup/database';

// GET /api/reviews?breederId=[id] - Get reviews for a breeder
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');

    if (!breederId) {
      return NextResponse.json(
        { error: 'breederId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.select().from(reviews)
      .where(eq(reviews.breederId, breederId))
      .orderBy(desc(reviews.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      reviews: result,
      lastKey: null,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

// POST /api/reviews - Create a new review
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const body = await request.json();
    const { breederId, rating, title, content } = body;

    // Validate required fields
    if (!breederId) {
      return NextResponse.json(
        { error: 'breederId is required' },
        { status: 400 }
      );
    }

    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json(
        { error: 'rating is required and must be a number between 1 and 5' },
        { status: 400 }
      );
    }

    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json(
        { error: 'title is required' },
        { status: 400 }
      );
    }

    if (
      !content ||
      typeof content !== 'string' ||
      content.trim().length === 0
    ) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const reviewItem = {
      id: `review-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      breederId: String(breederId),
      reviewerId: userId,
      reviewerName: clerkUser?.fullName || clerkUser?.firstName || 'Anonymous',
      rating: Math.round(rating),
      title: title.trim(),
      content: content.trim(),
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(reviews).values(reviewItem);

    return NextResponse.json({
      message: 'Review created successfully',
      review: reviewItem,
    });
  } catch (error) {
    console.error('Error creating review:', error);
    return NextResponse.json(
      { error: 'Failed to create review' },
      { status: 500 }
    );
  }
}
