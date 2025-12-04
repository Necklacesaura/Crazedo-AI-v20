import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const trendingSearches = pgTable("trending_searches", {
  id: serial("id").primaryKey(),
  keyword: text("keyword").notNull(),
  trendLabel: text("trend_label"),
  searchVolume: integer("search_volume"),
  date: text("date"),
  aiSummary: text("ai_summary"),
});

export const userSavedTrends = pgTable("user_saved_trends", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  keyword: text("keyword").notNull(),
  trendLabel: text("trend_label"),
  searchVolume: integer("search_volume"),
  date: text("date"),
  aiSummary: text("ai_summary"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertTrendingSearchSchema = createInsertSchema(trendingSearches).omit({
  id: true,
});

export const insertUserSavedTrendSchema = createInsertSchema(userSavedTrends).omit({
  id: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type InsertTrendingSearch = z.infer<typeof insertTrendingSearchSchema>;
export type TrendingSearch = typeof trendingSearches.$inferSelect;
export type InsertUserSavedTrend = z.infer<typeof insertUserSavedTrendSchema>;
export type UserSavedTrend = typeof userSavedTrends.$inferSelect;
