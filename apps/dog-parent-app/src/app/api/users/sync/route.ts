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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user details from Clerk
    const clerkUser = await currentUser();
    const name = clerkUser?.fullName || clerkUser?.firstName || 'User';
    const email = clerkUser?.primaryEmailAddress?.emailAddress || '';
    const clerkUserType = (clerkUser?.publicMetadata?.userType as string) || undefined;

    console.log('Session verification successful for user sync:', userId.substring(0, 10) + '...');

    const body = await request.json();
    const {
      userType: bodyUserType,
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

    // Resolve userType: body > Clerk publicMetadata > default
    const userType = bodyUserType || clerkUserType || 'dog-parent';

    const timestamp = new Date().toISOString();

    // Check if user already exists
    const [existingUser] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    const isNewUser = !existingUser;

    // Prepare user data with comprehensive fields
    const rawUserData: Record<string, any> = {
      userId: userId,
      email: email,
      name: name || email?.split('@')[0] || 'User',
      firstName: name?.split(' ')[0] || undefined,
      lastName: name?.split(' ').slice(1).join(' ') || undefined,
      displayName: existingUser?.displayName || name || email?.split('@')[0] || 'User',
      userType: existingUser?.userType || userType,
      phone: phone || existingUser?.phone || undefined,
      location: location || existingUser?.location || undefined,
      bio: bio || existingUser?.bio || undefined,
      profileImage: profileImage || existingUser?.profileImage || undefined,
      coverPhoto: coverPhoto || existingUser?.coverPhoto || undefined,
      galleryPhotos: galleryPhotos || (existingUser?.galleryPhotos as string[]) || [],
      verified: true,
      accountStatus: existingUser?.accountStatus || 'active',

      preferences: removeUndefinedValues({
        notifications: {
          email: true,
          sms: false,
          push: true,
          ...(existingUser?.preferences as any)?.notifications,
          ...preferences?.notifications
        },
        privacy: {
          showEmail: false,
          showPhone: true,
          showLocation: true,
          ...(existingUser?.preferences as any)?.privacy,
          ...preferences?.privacy
        }
      }),

      breederInfo: userType === 'breeder' || userType === 'both' ? removeUndefinedValues({
        kennelName: breederInfo?.kennelName || (existingUser?.breederInfo as any)?.kennelName || undefined,
        license: breederInfo?.license || (existingUser?.breederInfo as any)?.license || undefined,
        specialties: breederInfo?.specialties || (existingUser?.breederInfo as any)?.specialties || [],
        experience: breederInfo?.experience || (existingUser?.breederInfo as any)?.experience || 0,
        website: breederInfo?.website || (existingUser?.breederInfo as any)?.website || undefined,
        ...(existingUser?.breederInfo as any),
        ...breederInfo
      }) : (existingUser?.breederInfo as any),

      // Map adopterInfo to puppyParentInfo for the Drizzle schema
      puppyParentInfo: userType === 'dog-parent' || userType === 'both' ? removeUndefinedValues({
        housingType: adopterInfo?.housingType || (existingUser?.puppyParentInfo as any)?.housingType || undefined,
        yardSize: adopterInfo?.yardSize || (existingUser?.puppyParentInfo as any)?.yardSize || undefined,
        hasOtherPets: adopterInfo?.hasOtherPets || (existingUser?.puppyParentInfo as any)?.hasOtherPets || false,
        experienceLevel: adopterInfo?.experienceLevel || (existingUser?.puppyParentInfo as any)?.experienceLevel || 'first-time',
        preferredBreeds: adopterInfo?.preferredBreeds || (existingUser?.puppyParentInfo as any)?.preferredBreeds || [],
        ...(existingUser?.puppyParentInfo as any),
        ...adopterInfo
      }) : (existingUser?.puppyParentInfo as any),

      createdAt: existingUser?.createdAt || timestamp,
      updatedAt: timestamp,
      lastActiveAt: timestamp
    };

    // Clean undefined values from the top level
    const userData = removeUndefinedValues(rawUserData);

    if (isNewUser) {
      // Insert new user
      await db.insert(profiles).values(userData);
    } else {
      // Update existing user
      await db.update(profiles)
        .set(userData)
        .where(eq(profiles.userId, userId));
    }

    console.log(`User ${isNewUser ? 'created' : 'updated'} successfully:`, {
      userId: userId.substring(0, 10) + '...',
      email: email,
      name: userData.name,
      userType: userData.userType,
      isNewUser
    });

    // Also include adopterInfo alias in the response for backward compatibility
    const responseData = {
      ...userData,
      adopterInfo: userData.puppyParentInfo
    };

    return NextResponse.json({
      user: responseData,
      isNewUser,
      message: `User ${isNewUser ? 'created' : 'updated'} successfully`
    }, { status: isNewUser ? 201 : 200 });

  } catch (error: any) {
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
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const [user] = await db.select().from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Include adopterInfo alias for backward compatibility
    const responseData = {
      ...user,
      adopterInfo: user.puppyParentInfo
    };

    return NextResponse.json({ user: responseData });

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
