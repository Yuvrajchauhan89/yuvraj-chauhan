import { pgTable, serial, text, integer, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const sessionsTable = pgTable("sessions", {
  id: serial("id").primaryKey(),
  label: text("label"),
  startTime: timestamp("start_time", { withTimezone: true }).notNull().defaultNow(),
  endTime: timestamp("end_time", { withTimezone: true }),
  avgFocusScore: real("avg_focus_score"),
  totalFocusTime: integer("total_focus_time"),
  totalDistractionTime: integer("total_distraction_time"),
  distractionCount: integer("distraction_count"),
  focusPercentage: real("focus_percentage"),
  status: text("status", { enum: ["active", "completed"] }).notNull().default("active"),
});

export const insertSessionSchema = createInsertSchema(sessionsTable).omit({ id: true });
export type InsertSession = z.infer<typeof insertSessionSchema>;
export type Session = typeof sessionsTable.$inferSelect;
