// src/app/api/users/sync/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq } from '@homeforpup/database';

import { auth, currentUser } from '@clerk/nextjs/server';

// Helper function to remove undefined values from objects
function removeUndefinedValues(obj: any): any {
  if (obj === null || obj === undefined) {
    return undefined;
  }

  if (Array.isArray(obj)) {
    return obj.map(removeUndefinedValues).filter(item => item !== undefined);
  }

  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const [key, value] of Object.entries(obj)) {
      const cleanedValue = removeUndefinedValues(value);
      if (cleanedValue !== undefined) {
        cleaned[key] = cleanedValue;
      }
    }
    return Object.keys(cleaned).length > 0 ? cleaned : undefined;
  }

  return obj;
}

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    const decodedToken = {
      userId: userId,
      name: clerkUser?.fullName || clerkUser?.firstName || 'User',
      email: clerkUser?.primaryEmailAddress?.emailAddress || ''
    };

    console.log('Session verification successful for user sync:', decodedToken.userId.substring(0, 10) + '...');

    const body = await request.json();
    const {
      userType = 'breeder',
      phone,
      location,
      bio,
      profileImage,
      coverPhoto,
      galleryPhotos,
      preferences,
      breederInfo,
      adopterInfo
    } = body;

    const { name, email } = decodedToken;
    const timestamp = new Date().toISOString();

    // Check if user already exists
    const [existingUser] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    const isNewUser = !existingUser;

    // Prepare user data with comprehensive fields
    const rawUserData: Record<string, any> = {
      userId: userId,
      email: email,
      name: name,
      userType: userType,
      verified: (clerkUser?.publicMetadata?.isVerified as boolean) || false,
      accountStatus: 'active',
      phone: phone || existingUser?.phone || undefined,
      location: location || existingUser?.location || undefined,
      bio: bio || existingUser?.bio || undefined,
      profileImage: profileImage || existingUser?.profileImage || clerkUser?.imageUrl || undefined,
      coverPhoto: coverPhoto || existingUser?.coverPhoto || undefined,
      galleryPhotos: galleryPhotos || (existingUser as any)?.galleryPhotos || [],
      socialLinks: (existingUser as any)?.socialLinks || {},

      // Preferences
      preferences: removeUndefinedValues({
        notifications: {
          email: preferences?.notifications?.email ?? true,
          push: preferences?.notifications?.push ?? true,
          sms: preferences?.notifications?.sms ?? false,
          ...(existingUser?.preferences as any)?.notifications,
          ...preferences?.notifications
        },
        privacy: {
          profileVisibility: preferences?.privacy?.profileVisibility || 'public',
          showContactInfo: preferences?.privacy?.showContactInfo ?? true,
          showLocation: preferences?.privacy?.showLocation ?? true,
          ...(existingUser?.preferences as any)?.privacy,
          ...preferences?.privacy
        }
      }),

      // Handle breeder-specific info
      breederInfo: userType === 'breeder' || userType === 'both' ? removeUndefinedValues({
        kennelName: breederInfo?.kennelName || (existingUser?.breederInfo as any)?.kennelName || undefined,
        license: breederInfo?.license || (existingUser?.breederInfo as any)?.license || undefined,
        specialties: breederInfo?.specialties || (existingUser?.breederInfo as any)?.specialties || [],
        experience: breederInfo?.experience || (existingUser?.breederInfo as any)?.experience || 0,
        website: breederInfo?.website || (existingUser?.breederInfo as any)?.website || undefined,
        ...(existingUser?.breederInfo as any),
        ...breederInfo
      }) : (existingUser?.breederInfo as any),

      // Handle adopter-specific info
      puppyParentInfo: userType === 'dog-parent' || userType === 'both' ? removeUndefinedValues({
        housingType: adopterInfo?.housingType || (existingUser?.puppyParentInfo as any)?.housingType || undefined,
        yardSize: adopterInfo?.yardSize || (existingUser?.puppyParentInfo as any)?.yardSize || undefined,
        hasOtherPets: adopterInfo?.hasOtherPets || (existingUser?.puppyParentInfo as any)?.hasOtherPets || false,
        experienceLevel: adopterInfo?.experienceLevel || (existingUser?.puppyParentInfo as any)?.experienceLevel || 'first-time',
        preferredBreeds: adopterInfo?.preferredBreeds || (existingUser?.puppyParentInfo as any)?.preferredBreeds || [],
        ...(existingUser?.puppyParentInfo as any),
        ...adopterInfo
      }) : (existingUser?.puppyParentInfo as any),

      // Timestamps
      createdAt: existingUser?.createdAt || timestamp,
      updatedAt: timestamp,
      lastActiveAt: timestamp
    };

    // Clean all undefined values from the user data
    const userData = removeUndefinedValues(rawUserData);

    if (isNewUser) {
      // Create new profile
      await db.insert(profiles).values(userData);
    } else {
      // Update existing profile
      await db.update(profiles).set(userData).where(eq(profiles.userId, userId));
    }

    console.log(`User ${isNewUser ? 'created' : 'updated'} successfully:`, {
      userId: userId.substring(0, 10) + '...',
      email: email,
      name: userData.name,
      userType: userData.userType,
      isNewUser
    });

    return NextResponse.json({
      user: userData,
      isNewUser,
      message: `User ${isNewUser ? 'created' : 'updated'} successfully`
    }, { status: isNewUser ? 201 : 200 });

  } catch (error) {
    console.error('Error syncing user:', error);
    return NextResponse.json(
      {
        error: 'Failed to sync user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// GET endpoint to retrieve current user data
export async function GET(request: NextRequest) {
  try {
    // Get user session
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    // Get user from database
    const [result] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (!result) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ user: result });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch user data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
