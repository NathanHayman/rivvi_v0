import { z } from "zod";

export const createCallSchema = z.object({
  // similar to the call schema
  to: z.string(),
  from: z.string(),
  agentId: z.string(),
  metadata: z.record(z.string(), z.string()),
  variables: z.record(z.string(), z.string()),
  analysis: z.record(z.string(), z.string()),
  direction: z.enum(["inbound", "outbound"]),
  patientId: z.string(),
  orgId: z.string(),
  runId: z.string(),
  rowId: z.string(),
  status: z.enum(["pending", "calling", "completed", "failed"]),
  retellCallId: z.string(),
  recordingUrl: z.string(),
  publicLogUrl: z.string(),
  toNumber: z.string(),
  fromNumber: z.string(),
  disconnectionReason: z.string(),
  startTime: z.date(),
  endTime: z.date(),
  duration: z.number(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export const dispatchCallSchema = z.object({
  to: z.string(),
  from: z.string(),
  agentId: z.string(),
  metadata: z.record(z.string(), z.string()),
  variables: z.record(z.string(), z.string()),
});
