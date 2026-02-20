import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, comments, eq, asc } from '@homeforpup/database';

// GET /api/posts/[postId]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    const result = await db.select().from(comments)
      .where(eq(comments.postId, postId))
      .orderBy(asc(comments.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      comments: result,
      lastKey: null,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/comments - Create a new comment
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const commentItem = {
      id: `comment-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      postId,
      authorId: userId,
      authorName: clerkUser?.fullName || clerkUser?.firstName || 'Anonymous',
      content: content.trim(),
      createdAt: now,
    };

    await db.insert(comments).values(commentItem);

    return NextResponse.json({
      message: 'Comment created successfully',
      comment: commentItem,
    });
  } catch (error) {
    console.error('Error creating comment:', error);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
