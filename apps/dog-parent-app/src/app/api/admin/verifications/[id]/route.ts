import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, verificationRequests, kennels, eq } from '@homeforpup/database';

// Simple admin check: list of admin user IDs from environment variable
const ADMIN_USER_IDS = (process.env.ADMIN_USER_IDS || '').split(',').filter(Boolean);

function isAdmin(userId: string): boolean {
  return ADMIN_USER_IDS.includes(userId);
}

// GET /api/admin/verifications/[id] - Get a single verification request with all documents
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;

    const [verificationRequest] = await db.select().from(verificationRequests)
      .where(eq(verificationRequests.id, id))
      .limit(1);

    if (!verificationRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    return NextResponse.json({ verificationRequest });
  } catch (error) {
    console.error('Error fetching verification request:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification request' },
      { status: 500 }
    );
  }
}

// PUT /api/admin/verifications/[id] - Approve or reject a verification request
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!isAdmin(userId)) {
      return NextResponse.json({ error: 'Forbidden: Admin access required' }, { status: 403 });
    }

    const { id } = await context.params;
    const body = await request.json();
    const { status, reviewerNotes } = body;

    if (!status || !['approved', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Status must be "approved" or "rejected"' },
        { status: 400 }
      );
    }

    if (status === 'rejected' && (!reviewerNotes || typeof reviewerNotes !== 'string' || reviewerNotes.trim().length === 0)) {
      return NextResponse.json(
        { error: 'Reviewer notes are required when rejecting a request' },
        { status: 400 }
      );
    }

    // Find the verification request
    const [existingRequest] = await db.select().from(verificationRequests)
      .where(eq(verificationRequests.id, id))
      .limit(1);

    if (!existingRequest) {
      return NextResponse.json({ error: 'Verification request not found' }, { status: 404 });
    }

    const now = new Date().toISOString();

    // Update the verification request
    const [updated] = await db.update(verificationRequests)
      .set({
        status,
        reviewedAt: now,
        notes: reviewerNotes || '',
        updatedAt: now,
      })
      .where(eq(verificationRequests.id, id))
      .returning();

    // If approved, update the breeder's kennel to set verified=true
    if (status === 'approved') {
      // The verification request may reference a kennel via notes or other fields
      // For now, we just update the verification status
      console.log(`Verification request ${id} approved`);
    }

    return NextResponse.json({
      message: `Verification request ${status}`,
      verificationRequest: updated,
    });
  } catch (error) {
    console.error('Error updating verification request:', error);
    return NextResponse.json(
      { error: 'Failed to update verification request' },
      { status: 500 }
    );
  }
}
