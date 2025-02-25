import { z } from "zod";

export const createRunSchema = z.object({
  name: z.string().min(1),
  orgId: z.string().uuid(),
  campaignId: z.string().uuid(),
  scheduledTime: z.string().datetime().optional(),
});

export const startRunSchema = z.object({
  id: z.string().uuid(),
});

export const pauseRunSchema = z.object({
  id: z.string().uuid(),
});

export const resumeRunSchema = z.object({
  id: z.string().uuid(),
});

export const completeRunSchema = z.object({
  id: z.string().uuid(),
});

export const deleteRunSchema = z.object({
  id: z.string().uuid(),
});
