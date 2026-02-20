import { NextRequest, NextResponse } from 'next/server';
import { db, dogs, eq } from '@homeforpup/database';
import { checkDogAccess } from '@/lib/auth/kennelAccess';
import { DogPhoto } from '@homeforpup/shared-types';
import { v4 as uuidv4 } from 'uuid';

import { auth } from '@clerk/nextjs/server';

// POST /api/dogs/[id]/photos - Add photo
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;
    const body = await request.json();

    // Get existing dog
    const [existingDog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!existingDog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has permission
    const access = await checkDogAccess(userId, existingDog as any);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Create new photo record
    const photoId = uuidv4();
    const timestamp = new Date().toISOString();

    // Create photo object with only defined values
    const newPhoto: any = {
      id: photoId,
      dogId: dogId,
      url: body.url,
      category: body.category || 'general',
      takenDate: body.takenDate || timestamp,
      tags: body.tags || [],
      isProfilePhoto: Boolean(body.isProfilePhoto),
      createdAt: timestamp,
      updatedAt: timestamp,
    };

    // Add optional fields only if they exist
    if (body.thumbnailUrl) newPhoto.thumbnailUrl = body.thumbnailUrl;
    if (body.caption) newPhoto.caption = body.caption;
    if (body.photographer) newPhoto.photographer = body.photographer;

    // Update dog with new photo
    const existingPhotos = (existingDog.photoGallery as any[]) || [];
    const updatedPhotos = [...existingPhotos, newPhoto];

    // If this is set as profile photo, unset any existing profile photos
    if (body.isProfilePhoto) {
      updatedPhotos.forEach(photo => {
        if (photo.id !== photoId) {
          photo.isProfilePhoto = false;
        }
      });
    }

    await db.update(dogs)
      .set({ photoGallery: updatedPhotos, updatedAt: timestamp })
      .where(eq(dogs.id, dogId));

    return NextResponse.json({ photo: newPhoto }, { status: 201 });
  } catch (error) {
    console.error('Error adding photo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// GET /api/dogs/[id]/photos - Get photos for dog
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: dogId } = await params;

    const [dog] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);

    if (!dog) {
      return NextResponse.json({ error: 'Dog not found' }, { status: 404 });
    }

    // Check if user has access
    const access = await checkDogAccess(userId, dog as any);
    if (!access.hasAccess) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const photos = (dog.photoGallery as any[]) || [];

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
