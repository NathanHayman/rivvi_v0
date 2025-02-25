import { db } from "@/server/db";
import { runs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const { runId } = await params;

  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
    with: {
      campaign: true,
      rows: true,
    },
  });

  if (!run) {
    return new NextResponse("Run not found", { status: 404 });
  }

  // Convert dates to ISO strings for serialization
  const serializedRun = {
    ...run,
    createdAt: run.createdAt?.toISOString(),
    updatedAt: run.updatedAt?.toISOString(),
    metadata: {
      ...run.metadata,
      run: {
        ...run.metadata?.run,
        startTime: run.metadata?.run?.startTime,
        endTime: run.metadata?.run?.endTime,
        lastPausedAt: run.metadata?.run?.lastPausedAt,
      },
    },
    rows: run.rows.map((row) => ({
      ...row,
      createdAt: row.createdAt?.toISOString(),
      updatedAt: row.updatedAt?.toISOString(),
    })),
  };

  return NextResponse.json(serializedRun);
}
