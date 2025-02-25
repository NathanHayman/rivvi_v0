"use server";

import { db } from "@/server/db";
import { calls, rows, runs } from "@/server/db/schema";
import { desc, eq, sql } from "drizzle-orm";

export async function getRun(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
    with: {
      campaign: true,
    },
  });
  return run;
}

export async function getRunRows(
  runId: string,
  page: number,
  pageSize: number
) {
  const offset = (page - 1) * pageSize;

  const data = await db.query.rows.findMany({
    where: eq(rows.runId, runId),
    with: {
      patient: true,
      calls: {
        orderBy: [desc(calls.createdAt)],
        limit: 1,
      },
    },
    limit: pageSize,
    offset,
    orderBy: [rows.sortIndex],
  });

  const totalCount = await db
    .select({ count: sql<number>`count(*)` })
    .from(rows)
    .where(eq(rows.runId, runId));

  return {
    data,
    totalPages: Math.ceil(totalCount[0].count / pageSize),
    currentPage: page,
    hasNextPage: offset + data.length < totalCount[0].count,
  };
}
