// src/server/db/schema/rows.ts
import { PostCallData } from "@/types/zod";
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { rowStatus } from "./enums";
import { organizations } from "./organizations";
import { patients } from "./patients";
import { runs } from "./runs";

export const rows = pgTable("rows", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  runId: uuid("run_id")
    .references(() => runs.id)
    .notNull(),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  variables: jsonb("variables")
    .$type<{
      phone: string;
      firstName: string;
      lastName: string;
      dob: string;
      patientHash: string;
      emrId: string;
      secondaryPhone?: string;
      isMinor: boolean;
      [key: string]: any;
    }>()
    .notNull(),
  postCallData: jsonb("post_call_data").$type<PostCallData>(),
  status: rowStatus("status").notNull().default("pending"),
  error: text("error"),
  retellCallId: text("retell_call_id"),
  sortIndex: integer("sort_index").notNull(),
  attemptCount: integer("attempt_count").default(0).notNull(),
  lastAttemptAt: timestamp("last_attempt_at", { withTimezone: true }),
  nextAttemptAt: timestamp("next_attempt_at", { withTimezone: true }),
  isSkippable: boolean("is_skippable").default(false),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
