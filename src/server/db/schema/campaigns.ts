// src/server/db/schema/campaigns.ts
import { CampaignConfig } from "@/types/zod";
import {
  boolean,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { callDirection } from "./enums";
import { organizations } from "./organizations";

export const campaigns = pgTable("campaigns", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  name: text("name").notNull(),
  agentId: text("agent_id").notNull(),
  direction: callDirection().notNull().default("outbound"),
  enabled: boolean("enabled").default(true),
  config: jsonb("config").$type<CampaignConfig>().notNull(),
  description: text("description"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
