import { db } from "@/server/db";
import { organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getOrganizationSchema } from "./schema";

export async function getOrganization(
  props: z.infer<typeof getOrganizationSchema>
) {
  const { id } = getOrganizationSchema.parse(props);

  const org = await db.query.organizations.findFirst({
    where: eq(organizations.id, id),
  });

  return org;
}
