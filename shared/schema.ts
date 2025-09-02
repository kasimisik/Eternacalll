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

// User preferences and agent creation journey
export const userPreferences = pgTable("user_preferences", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: text("user_id").notNull(), // Clerk user ID
  currentStep: integer("current_step").default(1), // 1-4 for creation steps
  agentPurpose: text("agent_purpose"),
  targetAudience: text("target_audience"),
  agentPersona: text("agent_persona"),
  chosenVoiceId: text("chosen_voice_id"),
  chosenVoiceName: text("chosen_voice_name"),
  userProfession: text("user_profession"),
  userHobbies: text("user_hobbies"),
  preferredLanguage: text("preferred_language").default("tr"),
  creationData: json("creation_data"), // Additional flexible data storage
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
  voiceName: text("voice_name"),
  stability: real("stability").default(0.7),
  similarityBoost: real("similarity_boost").default(0.8),
  firstMessage: text("first_message").default("Merhaba! Size nasıl yardımcı olabilirim?"),
  language: text("language").default("tr"),
  agentPurpose: text("agent_purpose"),
  agentPersona: text("agent_persona"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  clerkUserId: true,
  email: true,
  subscription: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  currentStep: true,
  agentPurpose: true,
  targetAudience: true,
  agentPersona: true,
  chosenVoiceId: true,
  chosenVoiceName: true,
  userProfession: true,
  userHobbies: true,
  preferredLanguage: true,
  creationData: true,
});

export const insertAgentSchema = createInsertSchema(agents).pick({
  name: true,
  prompt: true,
  voiceId: true,
  voiceName: true,
  stability: true,
  similarityBoost: true,
  firstMessage: true,
  language: true,
  agentPurpose: true,
  agentPersona: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;
export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
export type Agent = typeof agents.$inferSelect;
