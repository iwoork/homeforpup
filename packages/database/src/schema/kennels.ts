import { pgTable, text, integer, real, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const kennels = pgTable('kennels', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  businessName: text('business_name'),
  website: text('website'),
  phone: text('phone'),
  email: text('email'),

  // Location
  address: jsonb('address').$type<{
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
    coordinates?: { latitude: number; longitude: number };
  }>(),

  // Facilities
  facilities: jsonb('facilities').$type<{
    indoorSpace: boolean;
    outdoorSpace: boolean;
    exerciseArea: boolean;
    whelpingArea: boolean;
    quarantineArea: boolean;
    groomingArea: boolean;
    veterinaryAccess: boolean;
    climateControl: boolean;
    security: boolean;
    other?: string[];
  }>(),

  // Capacity
  capacity: jsonb('capacity').$type<{
    maxDogs: number;
    maxLitters: number;
    currentDogs: number;
    currentLitters: number;
  }>(),

  // Ownership — jsonb arrays queried with @>
  owners: jsonb('owners').$type<string[]>().notNull().default([]),
  managers: jsonb('managers').$type<string[]>().notNull().default([]),
  createdBy: text('created_by').notNull(),

  // Status
  status: text('status').notNull().default('active'),
  verified: boolean('verified').notNull().default(false),
  verificationDate: text('verification_date'),

  // Legacy compat fields (from shared-types index.ts Kennel)
  ownerId: text('owner_id'),
  specialties: jsonb('specialties').$type<string[]>(),
  establishedDate: text('established_date'),
  licenseNumber: text('license_number'),
  businessType: text('business_type'),
  photoUrl: text('photo_url'),
  coverPhoto: text('cover_photo'),
  galleryPhotos: jsonb('gallery_photos').$type<string[]>(),
  isActive: boolean('is_active').notNull().default(true),
  isPublic: boolean('is_public').notNull().default(true),
  socialLinks: jsonb('social_links').$type<Record<string, string>>(),
  totalLitters: integer('total_litters'),
  totalDogs: integer('total_dogs'),
  averageLitterSize: real('average_litter_size'),

  // Media
  photos: jsonb('photos').$type<string[]>(),
  videos: jsonb('videos').$type<string[]>(),

  // Extended
  certifications: jsonb('certifications').$type<any[]>(),
  awards: jsonb('awards').$type<any[]>(),
  socialMedia: jsonb('social_media').$type<Record<string, string>>(),

  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
}, (table) => [
  index('kennels_created_by_idx').on(table.createdBy),
]);
