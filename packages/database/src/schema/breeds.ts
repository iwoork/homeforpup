import { pgTable, text, jsonb } from 'drizzle-orm/pg-core';

export const breeds = pgTable('breeds', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  breedGroup: text('breed_group'),
  sizeCategory: text('size_category'),
  breedType: text('breed_type'),
  description: text('description'),
  temperament: text('temperament'),
  lifeSpan: text('life_span'),
  weight: text('weight'),
  height: text('height'),
  origin: text('origin'),
  imageUrl: text('image_url'),
  characteristics: jsonb('characteristics').$type<any>(),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});

export const breedsSimple = pgTable('breeds_simple', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  altNames: text('alt_names'),
  breedGroup: text('breed_group'),
  sizeCategory: text('size_category'),
  breedType: text('breed_type'),
  hybrid: text('hybrid'),
  live: text('live'),
  coverPhotoUrl: text('cover_photo_url'),
  searchTerms: text('search_terms'),
  createdAt: text('created_at'),
  updatedAt: text('updated_at'),
});
