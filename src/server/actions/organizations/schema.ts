import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const createOrganizationSchema = z.object({
  clerkOrgId: z.string(),
  name: z.string().min(1),
  outboundPhone: z.string().regex(/^\+1\d{10}$/),
  timezone: z.string(),
  officeHours: z.object({
    start: z.string(),
    end: z.string(),
  }),
});

export const updateOrganizationSchema = z.object({
  id: idSchema,
  clerkOrgId: z.string().optional(),
  name: z.string().min(1).optional(),
  outboundPhone: z
    .string()
    .regex(/^\+1\d{10}$/)
    .optional(),
  timezone: z.string().optional(),
  officeHours: z
    .object({
      start: z.string().optional(),
      end: z.string().optional(),
    })
    .optional(),
});
