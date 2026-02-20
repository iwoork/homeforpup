// src/app/api/users/available/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db, profiles, eq, ne, and, ilike, sql } from '@homeforpup/database';

import { auth } from '@clerk/nextjs/server';

export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const currentUserId = userId;
    console.log('Fetching available users for:', currentUserId.substring(0, 10) + '...');

    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const userType = searchParams.get('userType'); // 'breeder', 'dog-parent', 'both'
    const search = searchParams.get('search');
    const location = searchParams.get('location');
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Cap at 100 for performance
    const offset = parseInt(searchParams.get('offset') || '0');

    console.log('Scanning users with params:', {
      userType,
      search,
      location,
      limit
    });

    // Build where conditions
    const conditions: any[] = [
      eq(profiles.accountStatus, 'active'),
      ne(profiles.userId, currentUserId)
    ];

    // Add user type filter if specified
    if (userType && ['breeder', 'dog-parent', 'both'].includes(userType)) {
      conditions.push(eq(profiles.userType, userType));
    }

    // Add search filter if specified (search in name, displayName, email)
    if (search && search.trim()) {
      const searchTerm = `%${search.trim()}%`;
      conditions.push(
        sql`(${profiles.name} ILIKE ${searchTerm} OR ${profiles.displayName} ILIKE ${searchTerm} OR ${profiles.email} ILIKE ${searchTerm})`
      );
    }

    // Add location filter if specified
    if (location && location.trim()) {
      conditions.push(ilike(profiles.location, `%${location.trim()}%`));
    }

    // Execute query
    const users = await db.select().from(profiles)
      .where(and(...conditions))
      .limit(limit)
      .offset(offset);

    console.log(`Found ${users.length} available users`);

    // Transform users for frontend consumption
    const availableUsers = users.map(user => ({
      userId: user.userId,
      name: user.displayName || user.name || 'Unknown User',
      displayName: user.displayName,
      email: (user.preferences as any)?.privacy?.showEmail ? user.email : undefined,
      userType: user.userType,
      location: (user.preferences as any)?.privacy?.showLocation ? user.location : undefined,
      profileImage: user.profileImage,
      verified: user.verified,
      // Include additional info that might be useful for messaging
      bio: user.bio,
      breederInfo: user.userType === 'breeder' || user.userType === 'both' ? {
        kennelName: (user.breederInfo as any)?.kennelName,
        specialties: (user.breederInfo as any)?.specialties,
        experience: (user.breederInfo as any)?.experience
      } : undefined
    })).sort((a, b) => {
      // Sort by name alphabetically
      return a.name.localeCompare(b.name);
    });

    // Check if there are more results
    const hasMore = users.length === limit;

    return NextResponse.json({
      users: availableUsers,
      total: availableUsers.length,
      hasMore,
      nextKey: null
    });

  } catch (error) {
    console.error('Error fetching available users:', error);
    return NextResponse.json(
      {
        error: 'Failed to fetch available users',
        details: process.env.NODE_ENV === 'development' ? String(error) : undefined
      },
      { status: 500 }
    );
  }
}
