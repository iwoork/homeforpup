import { pgTable, text, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const activities = pgTable('activities', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  metadata: jsonb('metadata').$type<any>(),
  timestamp: text('timestamp').notNull(),
  read: boolean('read').notNull().default(false),
  priority: text('priority').notNull().default('low'),
  category: text('category').notNull(),
}, (table) => [
  index('activities_user_id_timestamp_idx').on(table.userId, table.timestamp),
  index('activities_user_id_type_idx').on(table.userId, table.type),
  index('activities_user_id_category_idx').on(table.userId, table.category),
]);
