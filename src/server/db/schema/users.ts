// src/server/db/schema/users.ts
import { boolean, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { userRole } from "./enums";
import { organizations } from "./organizations";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  clerkId: text("clerk_id").notNull().unique(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  email: text("email").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  imageUrl: text("image_url"),
  role: userRole("role").notNull().default("user"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
});
