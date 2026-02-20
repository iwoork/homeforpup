import { pgTable, text, real, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const contracts = pgTable('contracts', {
  id: text('id').primaryKey(),
  breederId: text('breeder_id').notNull(),
  buyerId: text('buyer_id'),
  buyerName: text('buyer_name'),
  buyerEmail: text('buyer_email'),
  puppyId: text('puppy_id'),
  puppyName: text('puppy_name'),
  amount: real('amount'),
  depositAmount: real('deposit_amount'),
  depositPaid: boolean('deposit_paid').default(false),
  status: text('status').default('draft'),
  terms: text('terms'),
  documents: jsonb('documents').$type<string[]>(),
  signedAt: text('signed_at'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('contracts_breeder_id_idx').on(table.breederId),
  index('contracts_buyer_id_idx').on(table.buyerId),
]);
