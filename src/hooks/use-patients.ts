// hooks/queries.ts
import { db } from "@/server/db";
import { calls, patients } from "@/server/db/schema";
import { useQuery } from "@tanstack/react-query";
import { desc, eq, sql } from "drizzle-orm";

interface PaginationParams {
  page: number;
  pageSize: number;
}

// Patient Queries
export function usePatients(
  orgId: string,
  { page, pageSize }: PaginationParams
) {
  return useQuery({
    queryKey: ["patients", orgId, page, pageSize],
    queryFn: async () => {
      const offset = (page - 1) * pageSize;

      const data = await db.query.patients.findMany({
        where: eq(patients.orgId, orgId),
        with: {
          calls: {
            orderBy: [desc(calls.createdAt)],
            limit: 1,
          },
        },
        limit: pageSize,
        offset,
        orderBy: [desc(patients.createdAt)],
      });

      const totalCount = await db
        .select({ count: sql<number>`count(*)` })
        .from(patients)
        .where(eq(patients.orgId, orgId));

      return {
        data,
        totalPages: Math.ceil(totalCount[0].count / pageSize),
        currentPage: page,
      };
    },
  });
}

export function usePatientDetails(patientId: string) {
  return useQuery({
    queryKey: ["patient", patientId],
    queryFn: async () => {
      const patient = await db.query.patients.findFirst({
        where: eq(patients.id, patientId),
        with: {
          calls: {
            orderBy: [desc(calls.createdAt)],
            with: {
              run: {
                with: {
                  campaign: true,
                },
              },
            },
          },
        },
      });
      return patient;
    },
  });
}
