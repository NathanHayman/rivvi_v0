import { db } from "@/server/db";
import { campaigns } from "@/server/db/schema";
import { and, eq, like } from "drizzle-orm";
import { z } from "zod";
import { getCampaignSchema, getCampaignsByOrgIdSchema } from "./schema";

export async function getCampaignById(
  props: z.infer<typeof getCampaignSchema>
) {
  const { id } = getCampaignSchema.parse(props);

  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, id),
  });

  return campaign;
}

export async function getCampaignsByOrgId(
  props: z.infer<typeof getCampaignsByOrgIdSchema>
) {
  const { orgId, limit, offset, search } =
    getCampaignsByOrgIdSchema.parse(props);

  const campaignsList = await db.query.campaigns.findMany({
    where: search
      ? and(eq(campaigns.orgId, orgId), like(campaigns.name, `%${search}%`))
      : eq(campaigns.orgId, orgId),
    limit,
    offset,
  });

  return campaignsList;
}
