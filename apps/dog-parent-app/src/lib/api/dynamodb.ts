// Database operations using Drizzle ORM (Supabase PostgreSQL)
// Legacy filename kept for import compatibility
import { db, breeders, dogs, litters, kennels, eq, and, or, sql, inArray } from '@homeforpup/database';

export { db } from '@homeforpup/database';

export const dbOperations = {
  async createBreeder(breeder: any) {
    await db.insert(breeders).values(breeder);
  },

  async getBreeder(breederId: string) {
    const [result] = await db.select().from(breeders).where(eq(breeders.id, breederId)).limit(1);
    return { Item: result || undefined };
  },

  async updateBreeder(breederId: string, updates: any) {
    await db.update(breeders).set({ ...updates, updatedAt: new Date().toISOString() }).where(eq(breeders.id, breederId));
  },

  async createDog(dog: any) {
    await db.insert(dogs).values(dog);
  },

  async getDog(dogId: string) {
    const [result] = await db.select().from(dogs).where(eq(dogs.id, dogId)).limit(1);
    return { Item: result || undefined };
  },

  async getDogsByBreeder(breederId: string) {
    const result = await db.select().from(dogs).where(eq(dogs.ownerId, breederId));
    return { Items: result, Count: result.length };
  },

  async getBreedingDogs(breederId: string) {
    const result = await db.select().from(dogs).where(
      and(eq(dogs.ownerId, breederId), eq(dogs.breedingStatus, 'available'))
    );
    return { Items: result, Count: result.length };
  },

  async getPuppiesByLitter(litterId: string) {
    const result = await db.select().from(dogs).where(eq(dogs.litterId, litterId));
    return { Items: result, Count: result.length };
  },

  async createLitter(litter: any) {
    await db.insert(litters).values(litter);
  },

  async getLitter(litterId: string) {
    const [result] = await db.select().from(litters).where(eq(litters.id, litterId)).limit(1);
    return { Item: result || undefined };
  },

  async getLittersByBreeder(breederId: string) {
    const result = await db.select().from(litters).where(eq(litters.breederId, breederId));
    return { Items: result, Count: result.length };
  },

  async getLittersBySeason(breederId: string, season: string) {
    const result = await db.select().from(litters).where(
      and(eq(litters.breederId, breederId), eq(litters.season, season))
    );
    return { Items: result, Count: result.length };
  },

  async getLittersByParent(parentId: string) {
    const result = await db.select().from(litters).where(
      or(eq(litters.sireId, parentId), eq(litters.damId, parentId))
    );
    return { Items: result, Count: result.length };
  },
};
