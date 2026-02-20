import { db, kennels, dogs, eq, or, sql, and, inArray } from '@homeforpup/database';

export interface KennelAccessResult {
  hasAccess: boolean;
  accessType: 'owner' | 'direct' | 'kennel_owner' | 'kennel_manager' | 'none';
  kennelId?: string;
  kennelName?: string;
}

/**
 * Check if a user has access to a dog through direct ownership or kennel ownership
 */
export async function checkDogAccess(
  userId: string,
  dog: { id: string; ownerId: string; kennelId?: string | null; name: string }
): Promise<KennelAccessResult> {
  // Direct ownership check
  if (dog.ownerId === userId) {
    return {
      hasAccess: true,
      accessType: 'direct',
    };
  }

  // If dog has no kennel, and user doesn't own it directly, no access
  if (!dog.kennelId) {
    return {
      hasAccess: false,
      accessType: 'none',
    };
  }

  // Check kennel ownership
  try {
    const [kennel] = await db.select().from(kennels).where(eq(kennels.id, dog.kennelId)).limit(1);

    if (!kennel) {
      console.log(`Kennel ${dog.kennelId} not found for dog ${dog.id}`);
      return {
        hasAccess: false,
        accessType: 'none',
      };
    }

    // Check if user is kennel owner (jsonb array contains)
    if (kennel.owners && (kennel.owners as string[]).includes(userId)) {
      return {
        hasAccess: true,
        accessType: 'kennel_owner',
        kennelId: dog.kennelId,
        kennelName: kennel.name,
      };
    }

    // Check if user is kennel manager (jsonb array contains)
    if (kennel.managers && (kennel.managers as string[]).includes(userId)) {
      return {
        hasAccess: true,
        accessType: 'kennel_manager',
        kennelId: dog.kennelId,
        kennelName: kennel.name,
      };
    }

    return {
      hasAccess: false,
      accessType: 'none',
      kennelId: dog.kennelId,
      kennelName: kennel.name,
    };
  } catch (error) {
    console.error('Error checking kennel access:', error);
    return {
      hasAccess: false,
      accessType: 'none',
    };
  }
}

/**
 * Get all kennel IDs that a user has access to (as owner or manager)
 */
export async function getUserKennelIds(userId: string): Promise<string[]> {
  try {
    console.log('Getting kennel IDs for user:', userId);

    const userKennels = await db.select({ id: kennels.id }).from(kennels).where(
      or(
        sql`${kennels.owners}::jsonb @> ${JSON.stringify([userId])}::jsonb`,
        sql`${kennels.managers}::jsonb @> ${JSON.stringify([userId])}::jsonb`
      )
    );

    const kennelIds = userKennels.map(kennel => kennel.id);

    console.log(`Found ${kennelIds.length} accessible kennels for user ${userId}:`, kennelIds);
    return kennelIds;
  } catch (error) {
    console.error('Error getting user kennel IDs:', error);
    return [];
  }
}

/**
 * Get all dogs that a user has access to (direct ownership + kennel-based access)
 */
export async function getUserAccessibleDogs(userId: string, options: any = {}): Promise<{ dogs: any[]; total: number }> {
  try {
    console.log('Getting accessible dogs for user:', userId);

    // Get user's accessible kennel IDs
    const kennelIds = await getUserKennelIds(userId);

    // Build where conditions
    const conditions: any[] = [];

    // Include dogs owned directly by the user OR in user's kennels
    if (kennelIds.length > 0) {
      conditions.push(
        or(
          eq(dogs.ownerId, userId),
          inArray(dogs.kennelId, kennelIds)
        )
      );
    } else {
      conditions.push(eq(dogs.ownerId, userId));
    }

    // Add other filters from options
    if (options.search) {
      conditions.push(
        or(
          sql`${dogs.name} ILIKE ${'%' + options.search + '%'}`,
          sql`${dogs.callName} ILIKE ${'%' + options.search + '%'}`,
          sql`${dogs.breed} ILIKE ${'%' + options.search + '%'}`
        )
      );
    }

    if (options.type) {
      conditions.push(eq(dogs.dogType, options.type));
    }

    if (options.gender) {
      conditions.push(eq(dogs.gender, options.gender));
    }

    if (options.breed) {
      conditions.push(eq(dogs.breed, options.breed));
    }

    if (options.breedingStatus) {
      conditions.push(eq(dogs.breedingStatus, options.breedingStatus));
    }

    console.log('Querying dogs with filters for user:', userId);

    const allDogs = await db.select().from(dogs).where(and(...conditions));

    console.log(`Found ${allDogs.length} accessible dogs for user ${userId}`);

    // Apply sorting
    const sortBy = options.sortBy || 'updatedAt';
    const sortedDogs = [...allDogs];
    switch (sortBy) {
      case 'name':
        sortedDogs.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'breed':
        sortedDogs.sort((a, b) => a.breed.localeCompare(b.breed) || a.name.localeCompare(b.name));
        break;
      case 'birthDate':
        sortedDogs.sort((a, b) => new Date(b.birthDate).getTime() - new Date(a.birthDate).getTime());
        break;
      case 'updatedAt':
      default:
        sortedDogs.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
        break;
    }

    // Apply pagination
    const page = options.page || 1;
    const limit = options.limit || 20;
    const offset = options.offset || (page - 1) * limit;
    const startIndex = offset;
    const endIndex = startIndex + limit;
    const paginatedDogs = sortedDogs.slice(startIndex, endIndex);

    console.log(`Returning ${paginatedDogs.length} dogs (page ${page}, limit ${limit})`);

    return {
      dogs: paginatedDogs,
      total: sortedDogs.length
    };
  } catch (error) {
    console.error('Error getting user accessible dogs:', error);
    return { dogs: [], total: 0 };
  }
}
