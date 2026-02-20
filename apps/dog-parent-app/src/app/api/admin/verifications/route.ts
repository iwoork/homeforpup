import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, verificationRequests, eq, desc } from '@homeforpup/database';

// Simple admin check: list of admin user IDs from environment variable
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

// GET /api/admin/verifications - List all verification requests with pagination and status filter
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    let query = db.select().from(verificationRequests);

    if (status) {
      query = query.where(eq(verificationRequests.status, status)) as any;
    }

    const items = await query
      .orderBy(desc(verificationRequests.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({
      verificationRequests: items,
      nextKey: null,
      count: items.length,
    });
  } catch (error) {
    console.error('Error listing verification requests:', error);
    return NextResponse.json(
      { error: 'Failed to list verification requests' },
      { status: 500 }
    );
  }
}
