import { pgTable, text, jsonb, index } from 'drizzle-orm/pg-core';

export const milestones = pgTable('milestones', {
  id: text('id').primaryKey(),
  litterId: text('litter_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description'),
  date: text('date').notNull(),
  photos: jsonb('photos').$type<string[]>(),
  metadata: jsonb('metadata').$type<any>(),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('milestones_litter_id_idx').on(table.litterId),
]);
