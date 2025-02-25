import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getCallSchema = z.object({
  id: idSchema,
});
