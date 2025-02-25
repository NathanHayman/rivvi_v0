// hooks/queries.ts
import { getCall } from "@/queries/calls";
import { db } from "@/server/db";
import { calls, patients } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { desc, eq, sql } from "drizzle-orm";

interface PaginationParams {
  page: number;
  pageSize: number;
}

// Call Queries
export function useCalls(orgId: string, { page, pageSize }: PaginationParams) {
  return useQuery({
    queryKey: ["calls", orgId, page, pageSize],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;

      const data = await db.query.calls.findMany({
        where: eq(patients.orgId, orgId),
        with: {
          patient: true,
          run: {
            with: {
              campaign: true,
            },
          },
        },
        limit: pageSize,
        offset,
        orderBy: [desc(calls.createdAt)],
      });

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(calls)
        .innerJoin(patients, eq(calls.patientId, patients.id))
        .where(eq(patients.orgId, orgId));

      return {
        data,
        totalPages: Math.ceil(totalCount[0].count / pageSize),
        currentPage: page,
      };
    },
  });
}

// Run Queries
export function useCall(callId: string) {
  return useQuery({
    queryKey: ["call", callId],
    queryFn: () => getCall(callId),
  });
}
