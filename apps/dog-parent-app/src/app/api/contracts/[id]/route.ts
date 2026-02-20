import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, contracts, eq, and } from '@homeforpup/database';

// GET /api/contracts/[id] - Get a single contract
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const { searchParams } = new URL(request.url);
    const breederId = searchParams.get('breederId');

    if (breederId) {
      // Efficient: direct lookup with breederId
      const [contract] = await db.select().from(contracts)
        .where(and(eq(contracts.id, id), eq(contracts.breederId, breederId)))
        .limit(1);

      if (!contract) {
        return NextResponse.json(
          { error: 'Contract not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({ contract });
    }

    // Fallback: check session user as breederId
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [contract] = await db.select().from(contracts)
      .where(and(eq(contracts.id, id), eq(contracts.breederId, userId)))
      .limit(1);

    if (!contract) {
      return NextResponse.json(
        { error: 'Contract not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ contract });
  } catch (error) {
    console.error('Error fetching contract:', error);
    return NextResponse.json(
      { error: 'Failed to fetch contract' },
      { status: 500 }
    );
  }
}

// PUT /api/contracts/[id] - Update a contract
export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await context.params;
    const body = await request.json();

    // Build update object dynamically
    const updates: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    };

    const fields = [
      'buyerName', 'buyerEmail', 'puppyId',
      'status', 'amount', 'depositAmount',
      'depositPaid', 'terms',
    ];

    fields.forEach(field => {
      if (body[field] !== undefined) {
        updates[field] = body[field];
      }
    });

    // Handle legacy field name mapping
    if (body.totalAmount !== undefined) {
      updates.amount = body.totalAmount;
    }
    if (body.contractType !== undefined) {
      // contractType doesn't have a column, skip
    }

    const [updated] = await db.update(contracts)
      .set(updates)
      .where(and(eq(contracts.id, id), eq(contracts.breederId, userId)))
      .returning();

    return NextResponse.json({ contract: updated });
  } catch (error) {
    console.error('Error updating contract:', error);
    return NextResponse.json(
      { error: 'Failed to update contract' },
      { status: 500 }
    );
  }
}
