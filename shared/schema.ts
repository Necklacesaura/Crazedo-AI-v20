import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, serial, timestamp, jsonb, index } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for Replit Auth
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table for Replit Auth
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
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

export const insertTrendingSearchSchema = createInsertSchema(trendingSearches).omit({
  id: true,
});

export const insertUserSavedTrendSchema = createInsertSchema(userSavedTrends).omit({
  id: true,
});

export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertTrendingSearch = z.infer<typeof insertTrendingSearchSchema>;
export type TrendingSearch = typeof trendingSearches.$inferSelect;
export type InsertUserSavedTrend = z.infer<typeof insertUserSavedTrendSchema>;
export type UserSavedTrend = typeof userSavedTrends.$inferSelect;
