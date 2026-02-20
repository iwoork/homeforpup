import { pgTable, text, jsonb, index } from 'drizzle-orm/pg-core';

export const verificationRequests = pgTable('verification_requests', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  status: text('status').notNull().default('pending'),
  documents: jsonb('documents').$type<any[]>(),
  notes: text('notes'),
  reviewedBy: text('reviewed_by'),
  reviewedAt: text('reviewed_at'),
  rejectionReason: text('rejection_reason'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('verification_requests_user_id_idx').on(table.userId),
  index('verification_requests_status_idx').on(table.status),
]);
