import { pgTable, text, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const waitlist = pgTable('waitlist', {
  id: text('id').primaryKey(),
  litterId: text('litter_id').notNull(),
  userId: text('user_id').notNull(),
  userName: text('user_name'),
  userEmail: text('user_email'),
  position: integer('position'),
  status: text('status').default('active'),
  preferences: jsonb('preferences').$type<any>(),
  notes: text('notes'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('waitlist_litter_id_idx').on(table.litterId),
  index('waitlist_user_id_idx').on(table.userId),
]);
