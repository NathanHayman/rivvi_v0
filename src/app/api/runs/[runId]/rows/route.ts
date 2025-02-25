import { db } from "@/server/db";
import { rows } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(
  request: Request,
  { params }: { params: { runId: string } }
) {
  const { runId } = await params;

  const result = await db.query.rows.findMany({
    where: eq(rows.runId, runId),
  });

  return NextResponse.json(result);
}
