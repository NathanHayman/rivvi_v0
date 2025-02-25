import { z } from "zod";

// Common schema pieces
export const idSchema = z.string().uuid();

export const paginationSchema = z.object({
  page: z.string().transform(Number).default("1"),
  limit: z.string().transform(Number).default("20"),
});

// Reusable schemas
export const organizationSchema = z.object({
  name: z.string().min(1),
  outboundPhone: z.string().regex(/^\+1\d{10}$/),
  timezone: z.string(),
  officeHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const campaignSchema = z.object({
  name: z.string().min(1),
  agentId: z.string(),
  requiredFields: z.array(z.string()),
  campaignVariables: z.record(z.string()),
  validationRules: z.record(z.any()),
});

export const runSchema = z.object({
  name: z.string().min(1),
  campaignId: idSchema,
  scheduleTime: z.string().datetime().optional(),
});
