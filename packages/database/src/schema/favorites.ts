import { pgTable, text, jsonb, primaryKey, index } from 'drizzle-orm/pg-core';

export const favorites = pgTable('favorites', {
  userId: text('user_id').notNull(),
  puppyId: text('puppy_id').notNull(),
  puppyData: jsonb('puppy_data').$type<any>(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  primaryKey({ columns: [table.userId, table.puppyId] }),
  index('favorites_puppy_id_idx').on(table.puppyId),
]);
