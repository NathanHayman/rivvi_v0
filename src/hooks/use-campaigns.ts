// hooks/queries.ts
import { db } from "@/server/db";
import { campaigns, runs } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { desc, eq, sql } from "drizzle-orm";

interface PaginationParams {
  page: number;
  pageSize: number;
}

// Campaign Queries
export function useCampaigns(orgId: string) {
  return useQuery({
    queryKey: ["campaigns", orgId],
    queryFn: async () => {
      const data = await db.query.campaigns.findMany({
        where: eq(campaigns.orgId, orgId),
        with: {
          runs: {
            limit: 5,
            orderBy: [desc(runs.createdAt)],
          },
        },
      });
      return data;
    },
  });
}

export function useCampaignRuns(
  campaignId: string,
  { page, pageSize }: PaginationParams
) {
  return useQuery({
    queryKey: ["campaignRuns", campaignId, page, pageSize],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;

      const data = await db.query.runs.findMany({
        where: eq(runs.campaignId, campaignId),
        limit: pageSize,
        offset,
        orderBy: [desc(runs.createdAt)],
      });

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(runs)
        .where(eq(runs.campaignId, campaignId));

      return {
        data,
        totalPages: Math.ceil(totalCount[0].count / pageSize),
        currentPage: page,
      };
    },
  });
}
