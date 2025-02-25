import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getOrganizationSchema = z.object({
  id: idSchema,
});
