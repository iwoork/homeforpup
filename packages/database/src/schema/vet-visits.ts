import { pgTable, text, real, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const vetVisits = pgTable('vet_visits', {
  id: text('id').primaryKey(),
  dogId: text('dog_id').notNull(),
  ownerId: text('owner_id').notNull(),
  kennelId: text('kennel_id'),

  // Visit details
  visitDate: text('visit_date').notNull(),
  vetName: text('vet_name').notNull(),
  vetClinic: text('vet_clinic').notNull(),
  visitType: text('visit_type').notNull(),

  // Health information
  reason: text('reason').notNull(),
  diagnosis: text('diagnosis'),
  treatment: text('treatment'),
  medications: jsonb('medications').$type<string[]>(),
  weight: real('weight'),
  temperature: real('temperature'),

  // Follow-up
  followUpRequired: boolean('follow_up_required').notNull().default(false),
  followUpDate: text('follow_up_date'),
  followUpNotes: text('follow_up_notes'),

  // Cost
  cost: real('cost'),
  currency: text('currency').default('USD'),
  paid: boolean('paid').notNull().default(false),

  // Documentation
  documents: jsonb('documents').$type<string[]>(),
  notes: text('notes'),

  // Status
  status: text('status').notNull().default('scheduled'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('vet_visits_dog_id_visit_date_idx').on(table.dogId, table.visitDate),
  index('vet_visits_owner_id_visit_date_idx').on(table.ownerId, table.visitDate),
]);
