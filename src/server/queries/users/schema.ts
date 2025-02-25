import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getUserSchema = z.object({
  id: idSchema,
});
