import { pgTable, serial, integer, text, real, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const iotAlertsTable = pgTable("iot_alerts", {
  id: serial("id").primaryKey(),
  alertId: text("alert_id").notNull().unique(),
  sessionId: integer("session_id"),
  alertType: text("alert_type", { enum: ["DISTRACTION", "LOW_FOCUS", "SESSION_END", "SESSION_START"] }).notNull(),
  focusScore: real("focus_score"),
  message: text("message"),
  deviceId: text("device_id"),
  delivered: boolean("delivered").notNull().default(false),
  timestamp: timestamp("timestamp", { withTimezone: true }).notNull().defaultNow(),
});

export const insertIotAlertSchema = createInsertSchema(iotAlertsTable).omit({ id: true });
export type InsertIotAlert = z.infer<typeof insertIotAlertSchema>;
export type IotAlert = typeof iotAlertsTable.$inferSelect;
