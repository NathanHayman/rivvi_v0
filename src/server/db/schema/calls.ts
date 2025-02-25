// src/server/db/schema/calls.ts
import { CallAnalysis, CallMetadata, Variables } from "@/types/zod";
import {
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { callDirection, callStatus } from "./enums";
import { organizations } from "./organizations";
import { patients } from "./patients";
import { rows } from "./rows";
import { runs } from "./runs";

export const calls = pgTable("calls", {
  id: uuid("id").primaryKey().defaultRandom(),
  orgId: uuid("org_id")
    .references(() => organizations.id)
    .notNull(),
  runId: uuid("run_id").references(() => runs.id),
  rowId: uuid("row_id").references(() => rows.id),
  patientId: uuid("patient_id")
    .references(() => patients.id)
    .notNull(),
  agentId: text("agent_id").notNull(),
  direction: callDirection("direction").notNull(),
  status: callStatus("status").notNull().default("pending"),
  retellCallId: text("retell_call_id"),
  recordingUrl: text("recording_url"),
  publicLogUrl: text("public_log_url"),
  toNumber: text("to_number").notNull(),
  fromNumber: text("from_number").notNull(),
  metadata: jsonb("metadata").$type<CallMetadata>(),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  duration: integer("duration"),
  disconnectionReason: text("disconnection_reason"),
  analysis: jsonb("analysis").$type<CallAnalysis>(),
  variables: jsonb("variables").$type<Variables>(),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
