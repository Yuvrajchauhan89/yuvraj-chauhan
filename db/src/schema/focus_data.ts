import { pgTable, serial, integer, real, text, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";
import { sessionsTable } from "./sessions";

export const focusDataTable = pgTable("focus_data", {
  id: serial("id").primaryKey(),
  sessionId: integer("session_id").notNull().references(() => sessionsTable.id, { onDelete: "cascade" }),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
  focusScore: real("focus_score").notNull(),
  focusCategory: text("focus_category", { enum: ["HIGH_FOCUS", "MEDIUM_FOCUS", "LOW_FOCUS", "DISTRACTED"] }).notNull(),
  eyeOpenness: real("eye_openness"),
  gazeDirection: text("gaze_direction"),
  blinkRate: real("blink_rate"),
  headPose: text("head_pose"),
  isDistraction: boolean("is_distraction").notNull().default(false),
});

export const insertFocusDataSchema = createInsertSchema(focusDataTable).omit({ id: true });
export type InsertFocusData = z.infer<typeof insertFocusDataSchema>;
export type FocusData = typeof focusDataTable.$inferSelect;
