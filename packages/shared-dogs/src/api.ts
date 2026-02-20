import { db, dogs, profiles, eq, and, like, ilike, sql } from '@homeforpup/database';
import { Dog, DogsResponse, UseDogsOptions, CreateDogRequest, UpdateDogRequest, MatchedDogsResponse } from './types';
import { v4 as uuidv4 } from 'uuid';

export class DogsApiClient {
  async getDogs(options: UseDogsOptions = {}, userId?: string): Promise<DogsResponse> {
    const {
      search = '',
      kennelId = '',
      type = '',
      gender = '',
      breed = '',
      status = '',
      breedingStatus = '',
      page = 1,
      limit = 20,
      offset = 0,
      sortBy = 'updatedAt',
      ownerId
    } = options;

    // Build conditions
    const conditions: any[] = [];

    if (userId) {
      conditions.push(eq(dogs.ownerId, userId));
    } else if (ownerId) {
      conditions.push(eq(dogs.ownerId, ownerId));
    }

    if (search) {
      conditions.push(
        sql`(${dogs.name} ILIKE ${'%' + search + '%'} OR ${dogs.callName} ILIKE ${'%' + search + '%'} OR ${dogs.breed} ILIKE ${'%' + search + '%'})`
      );
    }

    if (kennelId) {
      conditions.push(eq(dogs.kennelId, kennelId));
    }

    if (type) {
      conditions.push(eq(dogs.dogType, type));
    }

    if (gender) {
      conditions.push(eq(dogs.gender, gender));
    }

    if (breed) {
      conditions.push(eq(dogs.breed, breed));
    }

    if (status) {
      conditions.push(eq(dogs.status, status));
    }

    if (breedingStatus) {
      conditions.push(eq(dogs.breedingStatus, breedingStatus));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const allDogs = await db
      .select()
      .from(dogs)
      .where(whereClause) as Dog[];

    // Apply sorting in JS (keeps behaviour identical to DynamoDB scan)
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
    const startIndex = offset || (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedDogs = sortedDogs.slice(startIndex, endIndex);
    const totalCount = sortedDogs.length;
    const totalPages = Math.ceil(totalCount / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;
    const hasMore = totalCount > endIndex;

    return {
      dogs: paginatedDogs,
      total: totalCount,
      count: paginatedDogs.length,
      page,
      limit,
      hasNextPage,
      hasPrevPage,
      totalPages,
      startIndex: startIndex + 1,
      endIndex: Math.min(endIndex, totalCount),
      hasMore
    };
  }

  async getDogById(id: string): Promise<Dog | null> {
    const [dog] = await db
      .select()
      .from(dogs)
      .where(eq(dogs.id, id))
      .limit(1);
    return (dog as Dog) || null;
  }

  async createDog(dogData: CreateDogRequest, userId: string): Promise<Dog> {
    const now = new Date().toISOString();
    const dog = {
      id: uuidv4(),
      ownerId: userId,
      ...dogData,
      weight: dogData.weight || 0,
      description: dogData.description || '',
      dogType: dogData.dogType || 'puppy',
      healthTests: [],
      breedingStatus: dogData.breedingStatus || 'not_ready',
      healthStatus: dogData.healthStatus || 'good',
      createdAt: now,
      updatedAt: now
    };

    await db.insert(dogs).values(dog);
    return dog as unknown as Dog;
  }

  async updateDog(dogData: UpdateDogRequest): Promise<Dog> {
    const now = new Date().toISOString();

    const existing = await this.getDogById(dogData.id);
    if (!existing) {
      throw new Error('Dog not found');
    }

    const { id, ...updateFields } = dogData;
    const [updated] = await db
      .update(dogs)
      .set({ ...updateFields, updatedAt: now })
      .where(eq(dogs.id, id))
      .returning();

    return updated as unknown as Dog;
  }

  async deleteDog(id: string): Promise<void> {
    await db.delete(dogs).where(eq(dogs.id, id));
  }

  async getMatchedDogs(userId: string): Promise<MatchedDogsResponse> {
    const [user] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, userId))
      .limit(1);

    if (!user) {
      return { matchedPuppies: [] };
    }

    const userCriteria = (user.puppyParentInfo as any) || {};

    if (!userCriteria.preferredBreeds || userCriteria.preferredBreeds.length === 0) {
      return { matchedPuppies: [] };
    }

    const availableDogs = await db
      .select()
      .from(dogs)
      .where(eq(dogs.breedingStatus, 'available'));

    const matchedPuppies = availableDogs.filter((dog: any) => {
      if (userCriteria.preferredBreeds && !userCriteria.preferredBreeds.includes(dog.breed)) {
        return false;
      }
      return true;
    }) as Dog[];

    matchedPuppies.sort((a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return { matchedPuppies, total: matchedPuppies.length };
  }
}

export const dogsApiClient = new DogsApiClient();
