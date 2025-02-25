import { db } from "@/server/db";
import { runs } from "@/server/db/schema";
import { TRun } from "@/types";
import { desc, eq } from "drizzle-orm";

export const findActiveRun = (runs: TRun[]) => {
  return runs.find((run) => run.status === "running");
};

export const findMostRecentRun = (runs: TRun[]) => {
  return runs.sort((a, b) => {
    if (!a.createdAt || !b.createdAt) {
      return 0;
    }
    return b.createdAt.getTime() - a.createdAt.getTime();
  })[0];
};

export const getRunsForCampaign = async (campaignId: string) => {
  if (!campaignId) {
    return [];
  }

  const data = await db.query.runs.findMany({
    where: eq(runs.campaignId, campaignId),
    orderBy: [desc(runs.createdAt)],
    with: {
      organization: true,
    },
  });

  if (!data) {
    return [];
  }

  return data;
};
