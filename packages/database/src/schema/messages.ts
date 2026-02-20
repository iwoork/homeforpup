import { pgTable, text, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const messages = pgTable('messages', {
  id: text('id').primaryKey(),
  threadId: text('thread_id').notNull(),
  senderId: text('sender_id').notNull(),
  senderName: text('sender_name').notNull(),
  senderAvatar: text('sender_avatar'),
  receiverId: text('receiver_id').notNull(),
  receiverName: text('receiver_name'),
  subject: text('subject'),
  content: text('content').notNull(),
  timestamp: text('timestamp').notNull(),
  read: boolean('read').notNull().default(false),
  messageType: text('message_type').notNull().default('general'),
  attachments: jsonb('attachments').$type<any[]>(),
  replyTo: text('reply_to'),
  createdAt: text('created_at'),
}, (table) => [
  index('messages_thread_id_timestamp_idx').on(table.threadId, table.timestamp),
  index('messages_sender_id_timestamp_idx').on(table.senderId, table.timestamp),
  index('messages_receiver_id_timestamp_idx').on(table.receiverId, table.timestamp),
]);
