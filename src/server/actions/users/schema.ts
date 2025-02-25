import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const createUserSchema = z.object({
  id: idSchema,
  clerkId: z.string(),
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  orgId: idSchema,
  role: z.enum(["admin", "user"]),
  imageUrl: z.string().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export const updateUserSchema = z.object({
  id: idSchema,
});
