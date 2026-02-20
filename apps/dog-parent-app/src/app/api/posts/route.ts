import { NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import { db, posts, eq, desc } from '@homeforpup/database';

const VALID_POST_TYPES = ['litter', 'health', 'achievement', 'event', 'available', 'general'] as const;
type PostType = typeof VALID_POST_TYPES[number];

// GET /api/posts?breederId=[id] or GET /api/posts?groupId=[id] - Get posts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');
    const groupId = searchParams.get('groupId');

    if (!breederId && !groupId) {
      return NextResponse.json(
        { error: 'breederId or groupId query parameter is required' },
        { status: 400 }
      );
    }

    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    let result;

    if (groupId) {
      result = await db.select().from(posts)
        .where(eq(posts.groupId, groupId))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    } else {
      result = await db.select().from(posts)
        .where(eq(posts.breederId, breederId!))
        .orderBy(desc(posts.createdAt))
        .limit(limit)
        .offset(offset);
    }

    return NextResponse.json({
      posts: result,
      lastKey: null,
      count: result.length,
    });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const body = await request.json();
    const { breederId, kennelId, groupId, title, content, postType, photos, tags } = body;

    // Validate required fields
    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'content is required' },
        { status: 400 }
      );
    }

    if (!postType || !VALID_POST_TYPES.includes(postType)) {
      return NextResponse.json(
        { error: `postType is required and must be one of: ${VALID_POST_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();
    const postItem = {
      id: `post-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      authorId: userId,
      authorName: clerkUser?.fullName || clerkUser?.firstName || 'Anonymous',
      breederId: String(breederId || ''),
      groupId: groupId ? String(groupId) : null,
      title: (title || '').trim(),
      content: content.trim(),
      type: postType as PostType,
      images: Array.isArray(photos) ? photos : [],
      tags: Array.isArray(tags) ? tags : [],
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(posts).values(postItem);

    return NextResponse.json({
      message: 'Post created successfully',
      post: postItem,
    });
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
}
