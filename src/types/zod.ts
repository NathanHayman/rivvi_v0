import { idSchema } from "@/lib/helpers/zod-validations";

import { z } from "zod";

// Types for field configurations
export type FieldConfig = {
  key: string;
  label: string;
  possibleColumns: string[];
  transform?: "date" | "time" | "phone" | "text" | "provider";
  required: boolean;
  description?: string;
};

// Types for variable configurations
export type VariablesConfig = {
  patient: {
    fields: FieldConfig[];
    validation: {
      requireValidPhone: boolean;
      requireValidDOB: boolean;
      requireName: boolean;
    };
  };
  campaign: {
    fields: FieldConfig[];
  };
};

export type Variables = {
  patient: {
    fields: {
      [key: string]: string;
    };
  };
  campaign: {
    fields: {
      [key: string]: string;
    };
  };
};

// Types for post-call analysis configuration
export type PostCallConfig = {
  standard: {
    fields: {
      key: string;
      label: string;
      type: "boolean" | "string" | "date" | "enum";
      options?: string[];
      required: boolean;
      description?: string;
    }[];
  };
  campaign: {
    fields: {
      key: string;
      label: string;
      type: "boolean" | "string" | "date" | "enum";
      options?: string[];
      required: boolean;
      description?: string;
      isMainKPI?: boolean;
    }[];
  };
};

export type CampaignConfig = {
  variables: VariablesConfig;
  postCall: PostCallConfig;
};

// Enums
export const runStatusSchema = z.enum([
  "draft",
  "processing",
  "ready",
  "scheduled",
  "running",
  "paused",
  "completed",
  "failed",
]);
export const rowStatusSchema = z.enum([
  "pending",
  "calling",
  "completed",
  "failed",
  "skipped",
]);
export const callStatusSchema = z.enum([
  "pending",
  "calling",
  "completed",
  "failed",
]);
export const callDirectionSchema = z.enum(["inbound", "outbound"]);
export const roleSchema = z.enum(["admin", "user", "superadmin"]);
export const timeZoneSchema = z.enum([
  "America/New_York",
  "America/Chicago",
  "America/Denver",
  "America/Los_Angeles",
  "America/Anchorage",
]);

// Models
export const organizationSchema = z.object({
  id: idSchema,
  clerkId: z.string(),
  name: z.string(),
  phone: z.string().regex(/^\+1\d{10}$/),
  timezone: timeZoneSchema,
  officeHours: z.object({
    start: z.string(),
    end: z.string(),
    days: z.array(z.number().min(0).max(6)),
  }),
  concurrencyLimit: z.number().min(1).max(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const userSchema = z.object({
  id: idSchema,
  clerkId: z.string(),
  orgId: idSchema,
  email: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  imageUrl: z.string().optional(),
  role: roleSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const campaignSchema = z.object({
  id: idSchema,
  orgId: idSchema,
  name: z.string(),
  agentId: z.string(),
  type: z.string(),
  enabled: z.boolean(),
  config: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const runMetadataSchema = z.object({
  rows: z.object({
    total: z.number(), // this is the valid/processed rows
    invalid: z.number(), // this is the invalid rows
  }),
  calls: z.object({
    failed: z.number(),
    calling: z.number(),
    pending: z.number(),
    skipped: z.number(),
    completed: z.number(),
    voicemail: z.number(),
    connected: z.number(),
    converted: z.number(),
    total: z.number(),
  }),
  run: z.object({
    error: z.string().optional(),
    endTime: z.string().datetime().optional(),
    startTime: z.string().datetime().optional(),
    lastPausedAt: z.string().datetime().optional(),
    scheduledTime: z.string().datetime().optional(),
    duration: z.number().optional(),
  }),
});

export const runSchema = z.object({
  id: idSchema,
  name: z.string(),
  status: runStatusSchema,
  metadata: runMetadataSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const rowSchema = z.object({
  id: idSchema,
  orgId: idSchema,
  runId: idSchema,
  patientId: idSchema,
  variables: z.record(z.any()),
  postCallData: z.record(z.any()),
  status: rowStatusSchema,
  error: z.string().optional(),
  retellCallId: z.string().optional(),
  sortIndex: z.number(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const createRetellCallMetadataSchema = z.object({
  runId: idSchema,
  orgId: idSchema,
  rowsId: idSchema,
  campaignId: idSchema,
});

// ^ The `analysis` object contains the results of the call analysis from Retell AI by default
// ^ This is located in the `body.call.analysis` object inside the webhook payload recieved in `post-call/route.ts
export const analysisDefaultSchema = z.object({
  transcript: z.string(),
  callSummary: z.string(),
  userSentiment: z.string(),
  callSuccessful: z.boolean(),
  callbackRequested: z.boolean(),
  callbackDateTime: z.string().nullable(),
  transferred: z.boolean(),
  transferReason: z.string().nullable(),
  patientQuestions: z.string().nullable(),
  patientReached: z.boolean(),
  detectedAI: z.boolean(),
  notes: z.string().nullable(),
});

//   this is where the other dynamic variables are added
export const callAnalysisSchema = analysisDefaultSchema
  .extend({
    //   this is where the other dynamic variables are added
  })
  .catchall(z.any());

export const postCallDataSchema = z.object({
  error: z.string().optional(),
  analysis: callAnalysisSchema,
  fromNumber: z.string(),
  recordingUrl: z.string(),
  duration: z.number(), // converted to seconds
});

export const callSchema = z.object({
  id: idSchema,
  orgId: idSchema,
  runId: idSchema,
  rowId: idSchema,
  patientId: idSchema,
  agentId: z.string(),
  status: callStatusSchema,
  error: z.string().optional(),
  analysis: callAnalysisSchema,
  toNumber: z.string(),
  fromNumber: z.string(),
  recordingUrl: z.string(),
  metadata: createRetellCallMetadataSchema,
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  duration: z.number(), // converted to seconds
  direction: callDirectionSchema,
  retellCallId: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const patientSchema = z.object({
  id: idSchema,
  orgId: idSchema,
  emrId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
  dob: z.string(),
  isMinor: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Organization = z.infer<typeof organizationSchema>;
export type User = z.infer<typeof userSchema>;
export type Campaign = z.infer<typeof campaignSchema>;
export type Run = z.infer<typeof runSchema>;
export type RunStatus = z.infer<typeof runStatusSchema>;
export type RunMetadata = z.infer<typeof runMetadataSchema>;
export type Row = z.infer<typeof rowSchema>;
export type RowStatus = z.infer<typeof rowStatusSchema>;
export type Call = z.infer<typeof callSchema>;
export type CallStatus = z.infer<typeof callStatusSchema>;
export type CallAnalysis = z.infer<typeof callAnalysisSchema>;
export type CallMetadata = z.infer<typeof createRetellCallMetadataSchema>;
export type Patient = z.infer<typeof patientSchema>;
export type PostCallData = z.infer<typeof postCallDataSchema>;
