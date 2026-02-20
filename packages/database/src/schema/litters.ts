import { pgTable, text, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const litters = pgTable('litters', {
  id: text('id').primaryKey(),
  breederId: text('breeder_id').notNull(),
  kennelId: text('kennel_id'),
  name: text('name'),
  breed: text('breed').notNull(),

  // Parents
  sireId: text('sire_id').notNull(),
  damId: text('dam_id').notNull(),
  sireName: text('sire_name'),
  damName: text('dam_name'),

  // Dates
  breedingDate: text('breeding_date'),
  expectedDate: text('expected_date'),
  birthDate: text('birth_date'),
  season: text('season'),

  // Counts
  puppyCount: integer('puppy_count'),
  maleCount: integer('male_count'),
  femaleCount: integer('female_count'),
  availablePuppies: integer('available_puppies'),
  expectedPuppyCount: integer('expected_puppy_count'),
  actualPuppyCount: integer('actual_puppy_count'),

  // Details
  description: text('description'),
  photos: jsonb('photos').$type<string[]>(),
  status: text('status').notNull().default('planned'),

  // Pricing
  priceRange: jsonb('price_range').$type<{ min: number; max: number }>(),

  // Health
  healthClearances: jsonb('health_clearances').$type<string[]>(),
  health: jsonb('health').$type<any>(),

  // Puppies (embedded array for kennel-style litters)
  puppies: jsonb('puppies').$type<any[]>(),

  // Notes
  notes: text('notes'),
  specialInstructions: text('special_instructions'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('litters_breeder_id_expected_date_idx').on(table.breederId, table.expectedDate),
  index('litters_status_expected_date_idx').on(table.status, table.expectedDate),
  index('litters_kennel_id_idx').on(table.kennelId),
]);
