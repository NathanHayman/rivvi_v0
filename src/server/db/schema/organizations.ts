// src/server/db/schema/organizations.ts
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";

export const organizations = pgTable("organizations", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  timezone: text("timezone").notNull(),
  officeHours: jsonb("office_hours").$type<{
    start: string;
    end: string;
    days: number[];
  }>(),
  concurrentCallLimit: integer("concurrent_call_limit").default(20),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
