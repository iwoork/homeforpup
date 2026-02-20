import { pgTable, text, integer, boolean, jsonb, index } from 'drizzle-orm/pg-core';

export const groups = pgTable('groups', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  description: text('description'),
  createdBy: text('created_by').notNull(),
  type: text('type'),
  privacy: text('privacy').default('public'),
  coverImage: text('cover_image'),
  rules: jsonb('rules').$type<string[]>(),
  tags: jsonb('tags').$type<string[]>(),
  memberCount: integer('member_count').default(0),
  isActive: boolean('is_active').default(true),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('groups_created_by_idx').on(table.createdBy),
]);

export const groupMembers = pgTable('group_members', {
  id: text('id').primaryKey(),
  groupId: text('group_id').notNull(),
  userId: text('user_id').notNull(),
  role: text('role').default('member'),
  joinedAt: text('joined_at').notNull(),
}, (table) => [
  index('group_members_group_id_idx').on(table.groupId),
  index('group_members_user_id_idx').on(table.userId),
]);
