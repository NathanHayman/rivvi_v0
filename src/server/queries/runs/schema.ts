import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getRunSchema = z.object({
  id: idSchema,
});
