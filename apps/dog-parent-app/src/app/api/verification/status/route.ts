import { NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, verificationRequests, eq, desc } from '@homeforpup/database';

// GET /api/verification/status - Get current user's verification status
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Query all verification requests for this user, sorted by most recent
    const requests = await db.select().from(verificationRequests)
      .where(eq(verificationRequests.userId, userId))
      .orderBy(desc(verificationRequests.createdAt));

    if (requests.length === 0) {
      return NextResponse.json({
        status: 'none',
        verificationRequest: null,
        message: 'No verification request found',
      });
    }

    // Return the most recent verification request
    const latestRequest = requests[0];

    return NextResponse.json({
      status: latestRequest.status,
      verificationRequest: latestRequest,
    });
  } catch (error) {
    console.error('Error fetching verification status:', error);
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    );
  }
}
