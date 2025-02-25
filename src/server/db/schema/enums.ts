// src/server/db/schema/enums.ts
import { pgEnum } from "drizzle-orm/pg-core";

export const callStatus = pgEnum("call_status", [
  "pending",
  "calling",
  "completed",
  "failed",
]);

export const callDirection = pgEnum("call_direction", ["inbound", "outbound"]);

// Enums for status tracking
export const runStatus = pgEnum("run_status", [
  "draft",
  "processing",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "failed",
]);

export const rowStatus = pgEnum("row_status", [
  "pending",
  "calling",
  "completed",
  "failed",
  "skipped",
]);

export const userRole = pgEnum("user_role", ["admin", "user", "superadmin"]);
