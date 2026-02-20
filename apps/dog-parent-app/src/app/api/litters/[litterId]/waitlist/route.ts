import { NextRequest, NextResponse } from 'next/server';
import { db, waitlist, eq } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// GET /api/litters/[litterId]/waitlist - Get waitlist entries for a litter
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ litterId: string }> }
) {
  try {
    const { litterId } = await context.params;

    const result = await db.select().from(waitlist)
      .where(eq(waitlist.litterId, litterId));

    const entries = result.sort(
      (a: any, b: any) => (a.position as number) - (b.position as number)
    );

    return NextResponse.json({ entries });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json(
      { error: 'Failed to fetch waitlist' },
      { status: 500 }
    );
  }
}

// POST /api/litters/[litterId]/waitlist - Add a new waitlist entry
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ litterId: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { litterId } = await context.params;
    const body = await request.json();

    if (!body.buyerName || !body.buyerEmail) {
      return NextResponse.json(
        { error: 'buyerName and buyerEmail are required' },
        { status: 400 }
      );
    }

    // Get current entries to determine next position
    const existing = await db.select().from(waitlist)
      .where(eq(waitlist.litterId, litterId));

    const maxPosition = existing.reduce(
      (max: number, item: any) => Math.max(max, (item.position as number) || 0),
      0
    );

    const entry = {
      id: uuidv4(),
      litterId,
      userId: userId,
      userName: body.buyerName,
      userEmail: body.buyerEmail,
      position: maxPosition + 1,
      status: body.status || 'active',
      notes: body.notes || null,
      preferences: body.genderPreference || body.colorPreference ? {
        genderPreference: body.genderPreference,
        colorPreference: body.colorPreference,
        depositAmount: body.depositAmount,
        depositPaid: body.depositPaid || false,
      } : null,
      createdAt: new Date().toISOString(),
    };

    await db.insert(waitlist).values(entry);

    return NextResponse.json({ entry }, { status: 201 });
  } catch (error) {
    console.error('Error creating waitlist entry:', error);
    return NextResponse.json(
      { error: 'Failed to create waitlist entry' },
      { status: 500 }
    );
  }
}
