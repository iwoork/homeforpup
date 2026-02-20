import { pgTable, text, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const messageThreads = pgTable('message_threads', {
  id: text('id').primaryKey(),
  subject: text('subject'),
  participants: jsonb('participants').$type<string[]>().notNull().default([]),
  participantNames: jsonb('participant_names').$type<Record<string, string>>(),
  participantInfo: jsonb('participant_info').$type<Record<string, any>>(),
  lastMessage: jsonb('last_message').$type<any>(),
  messageCount: integer('message_count').notNull().default(0),
  unreadCount: jsonb('unread_count').$type<Record<string, number>>().notNull().default({}),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('message_threads_updated_at_idx').on(table.updatedAt),
]);
