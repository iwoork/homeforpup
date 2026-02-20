import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, kennels, eq } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

// GET /api/puppies/[id] - Get puppy details with kennel data (public)
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const [dog] = await db.select().from(dogs).where(eq(dogs.id, id)).limit(1);

    if (!dog) {
      return NextResponse.json({ error: 'Puppy not found' }, { status: 404 });
    }

    // Fetch kennel data if the dog has a kennelId
    let kennel = null;
    if (dog.kennelId) {
      try {
        const [kennelResult] = await db.select().from(kennels)
          .where(eq(kennels.id, dog.kennelId))
          .limit(1);
        kennel = kennelResult || null;
      } catch (error) {
        console.error('Error fetching kennel:', error);
      }
    }

    // Calculate age in weeks
    const birthDate = new Date(dog.birthDate);
    const now = new Date();
    const ageWeeks = Math.floor(
      (now.getTime() - birthDate.getTime()) / (1000 * 60 * 60 * 24 * 7)
    );

    // Extract photo URL
    const profilePhoto = dog.photoGallery?.find(
      (photo: any) => photo.isProfilePhoto
    )?.url;
    const firstPhoto = dog.photoGallery?.[0]?.url;
    const photoUrl = dog.photoUrl || profilePhoto || firstPhoto;

    return NextResponse.json({
      ...dog,
      kennel,
      ageWeeks,
      photoUrl: photoUrl || null,
      location: kennel?.address
        ? `${(kennel.address as any).city}, ${(kennel.address as any).state}`
        : null,
    });
  } catch (error) {
    console.error('Error fetching puppy:', error);
    return NextResponse.json(
      {
        message: 'Error fetching puppy',
        error:
          process.env.NODE_ENV === 'development'
            ? String(error)
            : 'Internal server error',
      },
      { status: 500 }
    );
  }
}
