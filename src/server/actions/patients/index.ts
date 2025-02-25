import { z } from "zod";
import { createPatientSchema, updatePatientSchema } from "./schema";

export async function createPatient(
  props: z.infer<typeof createPatientSchema>
) {
  // TODO: Implement
}

export async function updatePatient(
  props: z.infer<typeof updatePatientSchema>
) {
  // TODO: Implement
}
