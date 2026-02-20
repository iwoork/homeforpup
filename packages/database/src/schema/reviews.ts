import { pgTable, text, integer, real, index } from 'drizzle-orm/pg-core';

export const reviews = pgTable('reviews', {
  id: text('id').primaryKey(),
  breederId: text('breeder_id').notNull(),
  reviewerId: text('reviewer_id').notNull(),
  reviewerName: text('reviewer_name'),
  rating: real('rating').notNull(),
  title: text('title'),
  content: text('content'),
  puppyName: text('puppy_name'),
  breed: text('breed'),
  avatar: text('avatar'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('reviews_breeder_id_idx').on(table.breederId),
  index('reviews_reviewer_id_created_at_idx').on(table.reviewerId, table.createdAt),
]);
