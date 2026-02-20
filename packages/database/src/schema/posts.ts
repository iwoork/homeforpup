import { pgTable, text, integer, jsonb, index } from 'drizzle-orm/pg-core';

export const posts = pgTable('posts', {
  id: text('id').primaryKey(),
  breederId: text('breeder_id'),
  groupId: text('group_id'),
  authorId: text('author_id').notNull(),
  authorName: text('author_name'),
  authorAvatar: text('author_avatar'),
  title: text('title'),
  content: text('content').notNull(),
  type: text('type'),
  images: jsonb('images').$type<string[]>(),
  tags: jsonb('tags').$type<string[]>(),
  likes: integer('likes').default(0),
  commentCount: integer('comment_count').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('posts_breeder_id_idx').on(table.breederId),
  index('posts_group_id_idx').on(table.groupId),
  index('posts_author_id_idx').on(table.authorId),
]);

export const comments = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  authorId: text('author_id').notNull(),
  authorName: text('author_name'),
  authorAvatar: text('author_avatar'),
  content: text('content').notNull(),
  parentId: text('parent_id'),
  likes: integer('likes').default(0),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at'),
}, (table) => [
  index('comments_post_id_idx').on(table.postId),
]);

export const reactions = pgTable('reactions', {
  id: text('id').primaryKey(),
  postId: text('post_id'),
  commentId: text('comment_id'),
  userId: text('user_id').notNull(),
  type: text('type').notNull(),
  createdAt: text('created_at').notNull(),
}, (table) => [
  index('reactions_post_id_idx').on(table.postId),
  index('reactions_comment_id_idx').on(table.commentId),
]);
