// Client exports
export { db, createLambdaDb } from './client';
export type { Database } from './client';

// Schema exports
export {
  profiles,
  dogs,
  kennels,
  litters,
  messages,
  messageThreads,
  favorites,
  activities,
  breeds,
  breedsSimple,
  veterinarians,
  vetVisits,
  breeders,
  reviews,
  posts,
  comments,
  reactions,
  groups,
  groupMembers,
  contracts,
  waitlist,
  milestones,
  verificationRequests,
  deviceTokens,
} from './schema';

// Re-export drizzle operators for convenience
export { eq, ne, gt, gte, lt, lte, like, ilike, and, or, not, inArray, sql, desc, asc } from 'drizzle-orm';
