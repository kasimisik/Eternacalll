import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, real } from "drizzle-orm/pg-core";
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

// AI Agents table for ElevenLabs integration
export const agents = pgTable("agents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Clerk user ID
  name: text("name").notNull(),
  prompt: text("prompt").notNull(),
  elevenlabsAgentId: text("elevenlabs_agent_id").notNull().unique(),
  voiceId: text("voice_id").notNull(),
  stability: real("stability").default(0.7),
  similarityBoost: real("similarity_boost").default(0.8),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  clerkUserId: true,
  email: true,
  subscription: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  prompt: true,
  voiceId: true,
  stability: true,
  similarityBoost: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
