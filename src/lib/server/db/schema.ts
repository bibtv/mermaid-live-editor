import { pgTable, text, timestamp, serial } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull()
});

export const diagrams = pgTable('diagrams', {
  content: text('content').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  id: serial('id').primaryKey(),
  title: text('title').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  userId: serial('user_id')
    .notNull()
    .references(() => users.id)
});

export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Diagram = typeof diagrams.$inferSelect;
export type NewDiagram = typeof diagrams.$inferInsert;
