import { pgTable, text, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const veterinarians = pgTable('veterinarians', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  name: text('name').notNull(),
  clinic: text('clinic').notNull(),
  phone: text('phone'),
  email: text('email'),
  address: text('address'),
  city: text('city'),
  state: text('state'),
  zipCode: text('zip_code'),
  country: text('country'),
  specialties: jsonb('specialties').$type<string[]>(),
  notes: text('notes'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('veterinarians_owner_id_created_at_idx').on(table.ownerId, table.createdAt),
]);
