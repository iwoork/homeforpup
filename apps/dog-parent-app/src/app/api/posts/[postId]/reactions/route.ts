import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, reactions, eq, and } from '@homeforpup/database';

const VALID_REACTION_TYPES = ['like', 'heart', 'celebrate'];

// GET /api/posts/[postId]/reactions - Get reaction counts and current user's reaction
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

    const { userId } = await auth();
    const currentUserId = userId || null;

    const result = await db.select().from(reactions)
      .where(eq(reactions.postId, postId));

    // Count reactions by type
    const counts: Record<string, number> = {};
    let userReaction: string | null = null;

    for (const reaction of result) {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
      if (currentUserId && reaction.userId === currentUserId) {
        userReaction = reaction.type;
      }
    }

    return NextResponse.json({
      counts,
      total: result.length,
      userReaction,
    });
  } catch (error) {
    console.error('Error fetching reactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reactions' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[postId]/reactions - Add or update a reaction
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    const body = await request.json();
    const { reactionType } = body;

    if (!reactionType || !VALID_REACTION_TYPES.includes(reactionType)) {
      return NextResponse.json(
        { error: `reactionType must be one of: ${VALID_REACTION_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    // Check if user already has a reaction on this post
    const [existing] = await db.select().from(reactions)
      .where(and(eq(reactions.postId, postId), eq(reactions.userId, userId)))
      .limit(1);

    if (existing) {
      // Update existing reaction
      await db.update(reactions)
        .set({ type: reactionType })
        .where(eq(reactions.id, existing.id));
    } else {
      // Insert new reaction
      const reactionItem = {
        id: `reaction-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        postId,
        userId: userId,
        type: reactionType,
        createdAt: now,
      };
      await db.insert(reactions).values(reactionItem);
    }

    return NextResponse.json({
      message: 'Reaction added successfully',
    });
  } catch (error) {
    console.error('Error adding reaction:', error);
    return NextResponse.json(
      { error: 'Failed to add reaction' },
      { status: 500 }
    );
  }
}

// DELETE /api/posts/[postId]/reactions - Remove the user's reaction
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ postId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const params = await context.params;
    const postId = params.postId;

    if (!postId) {
      return NextResponse.json(
        { error: 'postId is required' },
        { status: 400 }
      );
    }

    await db.delete(reactions).where(
      and(eq(reactions.postId, postId), eq(reactions.userId, userId))
    );

    return NextResponse.json({
      message: 'Reaction removed successfully',
    });
  } catch (error) {
    console.error('Error removing reaction:', error);
    return NextResponse.json(
      { error: 'Failed to remove reaction' },
      { status: 500 }
    );
  }
}
