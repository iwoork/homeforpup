import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { db, verificationRequests } from '@homeforpup/database';

interface VerificationDocument {
  type: 'license' | 'certification' | 'health_clearance' | 'insurance' | 'reference';
  name: string;
  url: string;
  uploadedAt: string;
}

const VALID_DOC_TYPES = ['license', 'certification', 'health_clearance', 'insurance', 'reference'] as const;

// POST /api/verification/submit - Create a new verification request
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { kennelId, documents } = body;

    // Validate at least one document
    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'At least one document is required' },
        { status: 400 }
      );
    }

    // Validate each document
    for (const doc of documents) {
      if (!doc.type || !VALID_DOC_TYPES.includes(doc.type)) {
        return NextResponse.json(
          { error: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` },
          { status: 400 }
        );
      }
      if (!doc.name || typeof doc.name !== 'string' || doc.name.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each document must have a name' },
          { status: 400 }
        );
      }
      if (!doc.url || typeof doc.url !== 'string' || doc.url.trim().length === 0) {
        return NextResponse.json(
          { error: 'Each document must have a url' },
          { status: 400 }
        );
      }
    }

    const now = new Date().toISOString();

    const verificationRequest = {
      id: `vr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
      userId,
      type: 'breeder_verification',
      status: 'pending',
      documents: documents.map((doc: { type: string; name: string; url: string }) => ({
        type: doc.type as VerificationDocument['type'],
        name: doc.name.trim(),
        url: doc.url.trim(),
        uploadedAt: now,
      })),
      notes: kennelId ? `Kennel ID: ${kennelId}` : null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insert(verificationRequests).values(verificationRequest);

    return NextResponse.json({
      message: 'Verification request submitted successfully',
      verificationRequest,
    }, { status: 201 });
  } catch (error) {
    console.error('Error submitting verification request:', error);
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    );
  }
}
