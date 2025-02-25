// src/server/db/schema/runs.ts
import { RunMetadata } from "@/types/zod";
import { jsonb, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { campaigns } from "./campaigns";
import { runStatus } from "./enums";
import { organizations } from "./organizations";

export const runs = pgTable("runs", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  campaignId: uuid("campaign_id")
    .references(() => campaigns.id)
    .notNull(),
  name: text("name").notNull(),
  status: runStatus("run_status").notNull().default("draft"),
  metadata: jsonb("metadata").$type<RunMetadata>().notNull(),
  rawFileUrl: text("raw_file_url"),
  processedFileUrl: text("processed_file_url"),
  createdById: uuid("created_by_id"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
