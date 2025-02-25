import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getCampaignSchema = z.object({
  id: idSchema,
});

export const getCampaignsByOrgIdSchema = z.object({
  orgId: idSchema,
  limit: z.number().optional(),
  offset: z.number().optional(),
  sortBy: z.enum(["createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
  search: z.string().optional(),
});
