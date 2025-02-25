"use server";

import { pusherServer } from "@/lib/pusher-server";
import { db } from "@/server/db";
import { calls, rows, runs } from "@/server/db/schema";
import { RunMetadata } from "@/types/zod";
import { and, eq, inArray, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { z } from "zod";
import { dispatchCall } from "../calls";
import {
  completeRunSchema,
  createRunSchema,
  pauseRunSchema,
  startRunSchema,
} from "./schema";

const defaultMetadata: RunMetadata = {
  rows: {
    total: 0,
    invalid: 0,
  },
  calls: {
    failed: 0,
    completed: 0,
    pending: 0,
    calling: 0,
    skipped: 0,
    total: 0,
    voicemail: 0,
    connected: 0,
    converted: 0,
  },
  run: {
    error: "",
    endTime: new Date().toISOString(),
    startTime: new Date().toISOString(),
    lastPausedAt: new Date().toISOString(),
    scheduledTime: new Date().toISOString(),
    duration: 0,
  },
};

// interface RunWithRelations {
//   campaign?: {
//     organization?: {
//       id: string;
//       clerkId: string;
//       name: string;
//       phone: string;
//       timezone: string;
//       officeHours: { start: string; end: string; days: number[] } | null;
//       createdAt: Date | null;
//       updatedAt: Date | null;
//       concurrentCallLimit: number | null;
//     } | null;
//     agentId: string;
//     id: string;
//   } | null;
//   status: string;
//   metadata?: RunMetadata | null;
// }

// Create a new run
export async function createRun(data: z.infer<typeof createRunSchema>) {
  const validated = createRunSchema.parse(data);

  const defaultMetadata: RunMetadata = {
    rows: {
      total: 0,
      invalid: 0,
    },
    calls: {
      failed: 0,
      completed: 0,
      pending: 0,
      calling: 0,
      skipped: 0,
      total: 0,
      voicemail: 0,
      connected: 0,
      converted: 0,
    },
    run: {
      error: "",
      endTime: "",
      startTime: "",
      lastPausedAt: "",
      scheduledTime: validated.scheduledTime || "",
      duration: 0,
    },
  };

  const [run] = await db
    .insert(runs)
    .values({
      id: uuidv4(),
      name: validated.name,
      campaignId: validated.campaignId,
      status: "draft",
      metadata: defaultMetadata,
      orgId: validated.orgId,
    })
    .returning();

  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
  revalidatePath("/campaigns/[campaignId]/runs", "page");

  return run;
}

// Start a run
export async function startRun(data: z.infer<typeof startRunSchema>) {
  const validated = startRunSchema.parse(data);

  // Get run details with campaign and org
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, validated.id),
    with: {
      campaign: {
        with: {
          organization: true,
        },
      },
    },
    columns: {
      id: true,
      name: true,
      status: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!run?.campaign?.organization) {
    throw new Error("Run not found or missing data");
  }

  const defaultMetadata: RunMetadata = {
    rows: {
      total: 0,
      invalid: 0,
    },
    calls: {
      failed: 0,
      completed: 0,
      pending: 0,
      calling: 0,
      skipped: 0,
      total: 0,
      voicemail: 0,
      connected: 0,
      converted: 0,
    },
    run: {
      error: "",
      endTime: "",
      startTime: new Date().toISOString(),
      lastPausedAt: "",
      scheduledTime: "",
      duration: 0,
    },
  };

  const currentMetadata = run.metadata || defaultMetadata;
  const updatedMetadata: RunMetadata = {
    ...currentMetadata,
    run: {
      ...currentMetadata.run,
      startTime: new Date().toISOString(),
    },
    calls: {
      ...currentMetadata.calls,
      pending: currentMetadata.calls?.total || 0,
    },
    rows: {
      ...currentMetadata.rows,
    },
  };

  // Update run status and metadata
  await db
    .update(runs)
    .set({
      status: "running",
      metadata: updatedMetadata,
    })
    .where(eq(runs.id, validated.id));

  // Notify clients
  await pusherServer.trigger(`run-${validated.id}`, "run-status-changed", {
    status: "running",
  });

  // Start processing calls in batches
  await processCalls(validated.id);
}

// Process calls in batches
async function processCalls(runId: string) {
  const BATCH_SIZE = 20;
  let processing = true;

  while (processing) {
    // Get run details
    const run = await db.query.runs.findFirst({
      where: eq(runs.id, runId),
      with: {
        campaign: {
          with: {
            organization: true,
          },
        },
      },
    });

    if (!run || run.status !== "running") {
      processing = false;
      continue;
    }

    // Get next batch of pending calls
    const pendingCalls = await db.query.rows.findMany({
      where: and(eq(rows.runId, runId), eq(rows.status, "pending")),
      limit: BATCH_SIZE,
    });

    if (pendingCalls.length === 0) {
      // No more calls to process
      await completeRun({ id: runId });
      processing = false;
      continue;
    }

    // Process batch
    for (const row of pendingCalls) {
      try {
        // Update status to calling
        await db
          .update(rows)
          .set({ status: "calling" })
          .where(eq(rows.id, row.id));

        if (!run.campaign?.organization?.phone || !run.campaign?.agentId) {
          throw new Error("Missing organization phone or agent ID");
        }

        console.log("row.variables", row.variables);

        // Dispatch call via Retell
        const call = await dispatchCall({
          to: row.variables?.phone as string,
          from: process.env.TEST_PHONE as string,
          agentId: run.campaign.agentId,
          metadata: {
            runId,
            rowsId: row.id,
            orgId: run.campaign.organization.id,
            campaignId: run.campaign.id,
          },
          variables: row.variables,
        });

        // Update with Retell call ID
        await db
          .update(rows)
          .set({ retellCallId: call.call_id })
          .where(eq(rows.id, row.id));

        // Notify clients
        await pusherServer.trigger(`run-${runId}`, "call-started", {
          rowsId: row.id,
          retellCallId: call.call_id ?? "",
        });
      } catch (error) {
        console.error("Error processing call:", error);

        // Update call status to failed
        await db
          .update(rows)
          .set({
            status: "failed",
            error: error instanceof Error ? error.message : "Unknown error",
          })
          .where(eq(rows.id, row.id));

        const currentMetadata = run.metadata || defaultMetadata;
        const updatedMetadata: RunMetadata = {
          ...currentMetadata,
          calls: {
            ...currentMetadata.calls,
            failed: (currentMetadata.calls?.failed || 0) + 1,
          },
          run: {
            ...currentMetadata.run,
            error: error instanceof Error ? error.message : "Unknown error",
          },
        };

        await db
          .update(runs)
          .set({
            metadata: updatedMetadata,
          })
          .where(eq(runs.id, runId));

        // Notify clients about the failure
        await pusherServer.trigger(`run-${runId}`, "call-failed", {
          rowId: row.id,
          error: error instanceof Error ? error.message : "Unknown error",
        });
      }
    }

    // Wait before processing next batch
    await new Promise((resolve) => setTimeout(resolve, 3000));
  }
}

// Complete a run
export async function completeRun(data: z.infer<typeof completeRunSchema>) {
  const validated = completeRunSchema.parse(data);

  const run = await db.query.runs.findFirst({
    where: eq(runs.id, validated.id),
  });

  if (!run) {
    throw new Error("Run not found");
  }

  const defaultMetadata: RunMetadata = {
    rows: {
      total: 0,
      invalid: 0,
    },
    calls: {
      failed: 0,
      completed: 0,
      pending: 0,
      calling: 0,
      skipped: 0,
      total: 0,
      voicemail: 0,
      connected: 0,
      converted: 0,
    },
    run: {
      error: "",
      endTime: new Date().toISOString(),
      startTime: "",
      lastPausedAt: "",
      scheduledTime: "",
      duration: 0,
    },
  };

  const currentMetadata = run.metadata || defaultMetadata;
  const startTime = currentMetadata.run?.startTime
    ? new Date(currentMetadata.run.startTime)
    : new Date();
  const endTime = new Date();
  const duration = Math.round((endTime.getTime() - startTime.getTime()) / 1000);

  const updatedMetadata: RunMetadata = {
    ...currentMetadata,
    run: {
      ...currentMetadata.run,
      endTime: endTime.toISOString(),
      duration,
    },
  };

  await db
    .update(runs)
    .set({
      status: "completed",
      metadata: updatedMetadata,
    })
    .where(eq(runs.id, validated.id));

  await pusherServer.trigger(`run-${validated.id}`, "run-status-changed", {
    status: "completed",
  });

  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
}

// Pause a run
export async function pauseRun(data: z.infer<typeof pauseRunSchema>) {
  const validated = pauseRunSchema.parse(data);

  const run = await db.query.runs.findFirst({
    where: eq(runs.id, validated.id),
  });

  if (!run) {
    throw new Error("Run not found");
  }

  const defaultMetadata: RunMetadata = {
    rows: {
      total: 0,
      invalid: 0,
    },
    calls: {
      failed: 0,
      completed: 0,
      pending: 0,
      calling: 0,
      skipped: 0,
      total: 0,
      voicemail: 0,
      connected: 0,
      converted: 0,
    },
    run: {
      error: "",
      endTime: "",
      startTime: "",
      lastPausedAt: new Date().toISOString(),
      scheduledTime: "",
      duration: 0,
    },
  };

  const currentMetadata = run.metadata || defaultMetadata;
  const updatedMetadata: RunMetadata = {
    ...currentMetadata,
    run: {
      ...currentMetadata.run,
      lastPausedAt: new Date().toISOString(),
    },
  };

  await db
    .update(runs)
    .set({
      status: "paused",
      metadata: updatedMetadata,
    })
    .where(eq(runs.id, validated.id));

  await pusherServer.trigger(`run-${validated.id}`, "run-status-changed", {
    status: "paused",
  });

  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
}

// Resume a paused run
export async function resumeRun(runId: string) {
  const [run] = await db
    .update(runs)
    .set({
      status: "running",
    })
    .where(eq(runs.id, runId))
    .returning();

  await pusherServer.trigger(`run-${runId}`, "run-status-changed", {
    status: "running",
  });

  // Resume processing calls
  await processCalls(runId);

  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
}

// Cancel a run
export async function cancelRun(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
  });

  if (!run) {
    throw new Error("Run not found");
  }

  const defaultMetadata: RunMetadata = {
    rows: {
      total: 0,
      invalid: 0,
    },
    calls: {
      failed: 0,
      completed: 0,
      pending: 0,
      calling: 0,
      skipped: 0,
      total: 0,
      voicemail: 0,
      connected: 0,
      converted: 0,
    },
    run: {
      error: "Run cancelled by user",
      endTime: new Date().toISOString(),
      startTime: "",
      lastPausedAt: "",
      scheduledTime: "",
      duration: 0,
    },
  };

  const currentMetadata = run.metadata || defaultMetadata;
  const updatedMetadata: RunMetadata = {
    ...currentMetadata,
    run: {
      ...currentMetadata.run,
      error: "Run cancelled by user",
      endTime: new Date().toISOString(),
    },
  };

  await db
    .update(runs)
    .set({
      status: "failed",
      metadata: updatedMetadata,
    })
    .where(eq(runs.id, runId));

  await pusherServer.trigger(`run-${runId}`, "run-status-changed", {
    status: "failed",
  });

  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
}

// Get run status
export async function getRunStatus(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
    columns: {
      status: true,
      metadata: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return run;
}

export async function deleteRun(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
    with: {
      rows: true,
    },
  });

  if (!run) {
    throw new Error("Run not found");
  }

  // Get all row IDs for this run
  const rowIds = run.rows.map((row) => row.id);

  // Delete all calls associated with these rows first
  await db
    .delete(calls)
    .where(or(eq(calls.runId, runId), inArray(calls.rowId, rowIds)));

  // Then delete all rows in the run
  await db.delete(rows).where(eq(rows.runId, runId));

  // Finally delete the run
  await db.delete(runs).where(eq(runs.id, runId));

  // Revalidate the runs page
  revalidatePath("/campaigns/[campaignId]/runs", "page");
  revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");
}
