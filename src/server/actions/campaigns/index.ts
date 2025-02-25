// server/actions/campaigns/index.ts
"use server";

import { db } from "@/server/db";
import { campaigns, runs } from "@/server/db/schema";
import { CampaignConfig } from "@/server/db/schema/campaigns";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { createCampaignSchema, updateCampaignSchema } from "./schema";

export async function createCampaign(
  orgId: string,
  props: z.infer<typeof createCampaignSchema>
) {
  try {
    const validated = createCampaignSchema.parse(props);

    // Validate there's at least one main KPI in campaign post-call fields
    const hasMainKPI = validated.config.postCall.campaign.fields.some(
      (field) => field.isMainKPI
    );

    if (!hasMainKPI) {
      throw new Error("Campaign must have at least one main KPI field");
    }

    // Create campaign
    const [campaign] = await db
      .insert(campaigns)
      .values({
        id: uuidv4(),
        orgId,
        name: validated.name,
        agentId: validated.agentId,
        type: validated.type,
        config: {
          variables: {
            patient: {
              fields: validated.config.variables.patient.fields,
              validation: validated.config.variables.patient.validation,
            },
            campaign: {
              fields: validated.config.variables.campaign.fields,
            },
          },
          postCall: {
            standard: {
              fields: validated.config.postCall.standard.fields,
            },
            campaign: {
              fields: validated.config.postCall.campaign.fields,
            },
          },
        },
      })
      .returning();

    revalidatePath("/campaigns");
    return campaign;
  } catch (error) {
    console.error("Error creating campaign:", error);
    throw error;
  }
}

// Update campaign schema - allows partial updates

export async function updateCampaign(
  id: string,
  props: z.infer<typeof updateCampaignSchema>
) {
  try {
    const validated = updateCampaignSchema.parse(props);

    // If updating post-call config, validate main KPI
    if (validated.config?.postCall?.campaign?.fields) {
      const hasMainKPI = validated.config.postCall.campaign.fields.some(
        (field) => field.isMainKPI
      );

      if (!hasMainKPI) {
        throw new Error("Campaign must have at least one main KPI field");
      }
    }

    const [campaign] = await db
      .update(campaigns)
      .set({
        ...validated,
        config: validated.config as CampaignConfig,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, id))
      .returning();

    revalidatePath(`/campaigns/${id}`);
    return campaign;
  } catch (error) {
    console.error("Error updating campaign:", error);
    throw error;
  }
}

export async function deleteCampaign(id: string) {
  try {
    // Delete all runs for the campaign
    await db.delete(runs).where(eq(runs.campaignId, id));
    // Delete the campaign
    await db.delete(campaigns).where(eq(campaigns.id, id));
    revalidatePath("/campaigns");
  } catch (error) {
    console.error("Error deleting campaign:", error);
    throw error;
  }
}
