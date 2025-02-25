import { z } from "zod";
import { getUserSchema } from "./schema";

export async function getUser(props: z.infer<typeof getUserSchema>) {
  // TODO: Implement
  console.log("getUser", props);
}
