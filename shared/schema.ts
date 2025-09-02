import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real, integer, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Users table for Clerk authentication
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  clerkUserId: text("clerk_user_id").notNull().unique(),
  email: text("email").notNull(),
  subscription: text("subscription").default("Free").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});



export const insertUserSchema = createInsertSchema(users).pick({
  clerkUserId: true,
  email: true,
  subscription: true,
});



export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
