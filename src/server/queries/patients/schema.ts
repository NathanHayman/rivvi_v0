import { idSchema } from "@/lib/helpers/zod-validations";
import { z } from "zod";

export const getPatientSchema = z.object({
  id: idSchema,
});
