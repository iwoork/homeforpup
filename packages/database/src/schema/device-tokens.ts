import { pgTable, text, index } from 'drizzle-orm/pg-core';

export const deviceTokens = pgTable('device_tokens', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  token: text('token').notNull(),
  platform: text('platform').notNull(),
  deviceName: text('device_name'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('device_tokens_user_id_idx').on(table.userId),
  index('device_tokens_token_idx').on(table.token),
]);
