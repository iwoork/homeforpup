import { pgTable, text, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const profiles = pgTable('profiles', {
  userId: text('user_id').primaryKey(),
  email: text('email').notNull(),
  name: text('name').notNull(),
  displayName: text('display_name'),

  // Legacy fields (from Cognito era)
  firstName: text('first_name'),
  lastName: text('last_name'),
  phone: text('phone'),
  location: text('location'),
  profileImage: text('profile_image'),
  bio: text('bio'),

  // Geolocation
  coordinates: jsonb('coordinates').$type<{ latitude: number; longitude: number }>(),

  // Additional imagery
  coverPhoto: text('cover_photo'),
  galleryPhotos: jsonb('gallery_photos').$type<string[]>(),

  // Verification and status
  verified: boolean('verified').notNull().default(false),
  accountStatus: text('account_status').notNull().default('active'),

  // Subscription
  isPremium: boolean('is_premium'),
  subscriptionPlan: text('subscription_plan'),
  subscriptionStatus: text('subscription_status'),
  subscriptionStartDate: text('subscription_start_date'),
  subscriptionEndDate: text('subscription_end_date'),
  stripeCustomerId: text('stripe_customer_id'),
  stripeSubscriptionId: text('stripe_subscription_id'),

  // Preferences
  preferences: jsonb('preferences').$type<{
    notifications: { email: boolean; sms: boolean; push: boolean };
    privacy: { showEmail: boolean; showPhone: boolean; showLocation: boolean };
  }>(),

  // Role-specific info
  breederInfo: jsonb('breeder_info').$type<{
    license?: string;
    specialties?: string[];
    experience?: number;
    website?: string;
  }>(),
  puppyParentInfo: jsonb('puppy_parent_info').$type<{
    housingType?: string;
    yardSize?: string;
    hasOtherPets?: boolean;
    experienceLevel?: string;
    preferredBreeds?: string[];
  }>(),

  // Social links
  socialLinks: jsonb('social_links').$type<{
    facebook?: string;
    instagram?: string;
    twitter?: string;
  }>(),

  // User type
  userType: text('user_type'),

  // Metadata
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  lastActiveAt: text('last_active_at'),
  profileViews: integer('profile_views'),
}, (table) => [
  index('profiles_stripe_customer_id_idx').on(table.stripeCustomerId),
]);
