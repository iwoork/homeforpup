import { pgTable, text, integer, real, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const dogs = pgTable('dogs', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  kennelId: text('kennel_id'),
  name: text('name').notNull(),
  callName: text('call_name'),
  breed: text('breed').notNull(),
  gender: text('gender').notNull(),
  birthDate: text('birth_date').notNull(),
  weight: real('weight'),
  color: text('color').notNull(),
  photoUrl: text('photo_url'),
  photoGallery: jsonb('photo_gallery').$type<any[]>(),
  lifeEvents: jsonb('life_events').$type<any[]>(),
  healthTests: jsonb('health_tests').$type<string[]>(),
  pedigree: text('pedigree'),
  description: text('description'),

  // Physical characteristics
  height: real('height'),
  eyeColor: text('eye_color'),
  markings: text('markings'),

  // Behavioral / care
  temperament: text('temperament'),
  specialNeeds: text('special_needs'),
  notes: text('notes'),

  // Parent references
  sireId: text('sire_id'),
  damId: text('dam_id'),
  sireName: text('sire_name'),
  damName: text('dam_name'),

  // Status fields
  breedingStatus: text('breeding_status').notNull().default('not_ready'),
  healthStatus: text('health_status').notNull().default('good'),
  dogType: text('dog_type').notNull().default('puppy'),
  status: text('status'),

  // Litter info (if puppy)
  litterId: text('litter_id'),
  litterPosition: integer('litter_position'),

  // Extended kennel-style data
  health: jsonb('health').$type<any>(),
  breeding: jsonb('breeding').$type<any>(),
  photos: jsonb('photos').$type<string[]>(),
  videos: jsonb('videos').$type<string[]>(),
  veterinaryVisits: jsonb('veterinary_visits').$type<any[]>(),
  trainingRecords: jsonb('training_records').$type<any[]>(),
  pedigreeInfo: jsonb('pedigree_info').$type<any>(),

  // Registration
  registrationNumber: text('registration_number'),
  microchipNumber: text('microchip_number'),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('dogs_owner_id_idx').on(table.ownerId),
  index('dogs_kennel_id_idx').on(table.kennelId),
  index('dogs_litter_id_idx').on(table.litterId),
  index('dogs_breed_idx').on(table.breed),
]);
