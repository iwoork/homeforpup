import { NextRequest, NextResponse } from 'next/server';
import { db, contracts, eq, and, desc } from '@homeforpup/database';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// GET /api/contracts?breederId=[id] - Get contracts for a breeder
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

    const result = await db.select().from(contracts)
      .where(eq(contracts.breederId, breederId))
      .orderBy(desc(contracts.createdAt));

    return NextResponse.json({ contracts: result });
  } catch (error) {
    console.error('Error fetching contracts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contracts' },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    if (!body.buyerName || !body.buyerEmail) {
      return NextResponse.json(
        { error: 'buyerName and buyerEmail are required' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString();

    const contract = {
      id: uuidv4(),
      breederId: userId,
      buyerName: body.buyerName,
      buyerEmail: body.buyerEmail,
      puppyId: body.puppyId || null,
      status: body.status || 'draft',
      amount: body.totalAmount || null,
      depositAmount: body.depositAmount || null,
      depositPaid: body.depositPaid || false,
      terms: body.terms || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(contracts).values(contract);

    return NextResponse.json({ contract }, { status: 201 });
  } catch (error) {
    console.error('Error creating contract:', error);
    return NextResponse.json(
      { error: 'Failed to create contract' },
      { status: 500 }
    );
  }
}
