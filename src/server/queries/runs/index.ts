import { db } from "@/server/db";
import { rows, runs } from "@/server/db/schema";
import { asc, eq } from "drizzle-orm";

export async function getRun(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
  });

  if (!run) {
    throw new Error("Run not found");
  }

  return run;
}

export async function getRunRows(
  runId: string,
  { page = 1, pageSize = 50 } = {}
) {
  const runData = await db.query.rows.findMany({
    where: eq(rows.runId, runId),
    orderBy: [asc(rows.createdAt)],
    offset: (page - 1) * pageSize,
    limit: pageSize,
  });

  return runData;
}
