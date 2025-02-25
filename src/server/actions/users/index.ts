import { z } from "zod";
import { createUserSchema, updateUserSchema } from "./schema";

export async function createUser(props: z.infer<typeof createUserSchema>) {
  // TODO: Implement
}

export async function updateUser(props: z.infer<typeof updateUserSchema>) {
  // TODO: Implement
}
