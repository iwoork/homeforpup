// Database client for Lambda handlers (Supabase PostgreSQL via Drizzle ORM)
import { createLambdaDb } from '@homeforpup/database';
export type { Database } from '@homeforpup/database';

let _db: ReturnType<typeof createLambdaDb>;

export function getDb() {
  if (!_db) _db = createLambdaDb();
  return _db;
}

// Re-export schema tables and operators for convenience
export { profiles, dogs, kennels, litters, messages, messageThreads, favorites, activities, breeds, breedsSimple, veterinarians, vetVisits, breeders } from '@homeforpup/database';
export { eq, ne, gt, gte, lt, lte, and, or, not, inArray, sql, desc, asc } from '@homeforpup/database';
