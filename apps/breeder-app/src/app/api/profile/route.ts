import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq } from '@homeforpup/database';
import { auth, currentUser } from '@clerk/nextjs/server';

interface ProfileUpdateRequest {
  name?: string;
  firstName?: string;
  lastName?: string;
  displayName?: string;
  phone?: string;
  country?: {code: string, name: string, dialCode: string, flag: string};
  location?: string;
  bio?: string;
  profileImage?: string;
  coverPhoto?: string;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  preferences?: {
    notifications?: {
      email?: boolean;
      sms?: boolean;
      push?: boolean;
    };
    privacy?: {
      showEmail?: boolean;
      showPhone?: boolean;
      showLocation?: boolean;
    };
  };
  breederInfo?: {
    kennelName?: string;
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  };
}

// GET current user profile
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const clerkUser = await currentUser();

    // Get user from database
    const [result] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (!result) {
      // If user doesn't exist in database, return Clerk user data
      const userProfile = {
        userId: userId,
        email: clerkUser?.primaryEmailAddress?.emailAddress || '',
        name: clerkUser?.fullName || clerkUser?.firstName || '',
        firstName: clerkUser?.firstName || '',
        lastName: clerkUser?.lastName || '',
        phone: '',
        location: '',
        bio: '',
        profileImage: clerkUser?.imageUrl || '',
        userType: (clerkUser?.publicMetadata?.userType as string) || 'breeder',
        verified: false,
        subscriptionPlan: 'free',
        subscriptionStatus: 'active',
        isPremium: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };

      return NextResponse.json({ user: userProfile });
    }

    return NextResponse.json({ user: result });

  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch profile data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}

// PUT update user profile
export async function PUT(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body: ProfileUpdateRequest = await request.json();
    const timestamp = new Date().toISOString();

    console.log('=== PROFILE UPDATE START ===');
    console.log('User ID:', userId.substring(0, 10) + '...');
    console.log('Update data:', body);

    // Get existing user data
    const [existingUser] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Build update data
    const updateData: Record<string, any> = {
      updatedAt: timestamp,
      lastActiveAt: timestamp,
    };

    if (body.name !== undefined) updateData.name = body.name;
    if (body.firstName !== undefined) updateData.firstName = body.firstName;
    if (body.lastName !== undefined) updateData.lastName = body.lastName;
    if (body.displayName !== undefined) updateData.displayName = body.displayName;
    if (body.phone !== undefined) updateData.phone = body.phone;
    if (body.location !== undefined) updateData.location = body.location;
    if (body.bio !== undefined) updateData.bio = body.bio;
    if (body.profileImage !== undefined) updateData.profileImage = body.profileImage;
    if (body.coverPhoto !== undefined) updateData.coverPhoto = body.coverPhoto;
    if (body.socialLinks !== undefined) updateData.socialLinks = body.socialLinks;
    if (body.preferences !== undefined) updateData.preferences = body.preferences;
    if (body.breederInfo !== undefined) updateData.breederInfo = body.breederInfo;

    // Update user
    const [updatedUser] = await db.update(profiles)
      .set(updateData)
      .where(eq(profiles.userId, userId))
      .returning();

    console.log('=== PROFILE UPDATE COMPLETE ===');

    return NextResponse.json({
      user: updatedUser,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      {
        error: 'Failed to update profile data',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
