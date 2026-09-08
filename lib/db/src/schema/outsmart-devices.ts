import { pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const outsmartDevicesTable = pgTable("outsmart_devices", {
  id: text("id").primaryKey(),
  stripeCustomerId: text("stripe_customer_id"),
  trialStartedAt: timestamp("trial_started_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertOutsmartDeviceSchema = createInsertSchema(outsmartDevicesTable);
export type InsertOutsmartDevice = z.infer<typeof insertOutsmartDeviceSchema>;
export type OutsmartDevice = typeof outsmartDevicesTable.$inferSelect;