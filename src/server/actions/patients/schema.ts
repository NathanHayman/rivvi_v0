import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const createPatientSchema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export const updatePatientSchema = z.object({
  id: idSchema,
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
  dob: z.string().datetime().optional(),
  phone: z
    .string()
    .regex(/^\+1\d{10}$/)
    .optional(),
  patientHash: z.string().optional(),
  orgId: idSchema,
});
