import { pusherServer } from "@/lib/pusher-server";
import { db } from "@/server/db";
import {
  calls,
  campaigns,
  patients,
  Row,
  rows,
  runs,
} from "@/server/db/schema";
import { RetellPostCallWebhook } from "@/types/retell";
import { CallAnalysis, PostCallData, RunMetadata } from "@/types/zod";
import { desc, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

function findColumn(callAnalysis: any, key: string) {
  const flattenedAnalysis = Object.entries(callAnalysis).reduce<
    Record<string, any>
  >((acc, [k, v]) => {
    if (typeof v === "object" && v !== null) {
      Object.entries(v).forEach(([subKey, subValue]) => {
        acc[`${k}.${subKey}`] = subValue;
      });
    } else {
      acc[k] = v;
    }
    return acc;
  }, {});

  return flattenedAnalysis[key] ?? null;
}

type RowRecord = Row & {
  run: {
    id: string;
    campaign: { id: string };
    organization: { id: string };
  };
  postCallData: PostCallData;
};

export async function POST(req: Request) {
  try {
    const payload = (await req.json()) as RetellPostCallWebhook["body"];
    console.log("payload", payload);

    // 1. Check if the `payload.event` is a `call_analyzed` event (this is the only event we want to process)
    if (payload.event !== "call_analyzed") {
      return new Response("Ignored - Not a call_analyzed event", {
        status: 200,
      });
    }

    // 2. Check if the call is inbound or outbound from the `payload.call.direction`
    const isInbound = payload.call.direction === "inbound";

    // 3. Get the phone number of the patient (inbound or outbound) from the `payload.call.from_number` or `payload.call.to_number`
    const phoneNumber = isInbound
      ? payload.call.from_number
      : payload.call.to_number;

    // 4. Check if the phone number is present in the payload (if not, throw an error)
    if (!phoneNumber) {
      throw new Error("Missing phone number from webhook payload");
    }

    // 5. Check if the `payload.call.agent_id` is present in the payload
    if (!payload.call.agent_id) {
      throw new Error("Missing agentId from webhook payload");
    }

    // 6. Find patient based on phone number
    const existingPatient = await db.query.patients.findFirst({
      where: eq(patients.primaryPhone, phoneNumber),
      with: {
        calls: {
          orderBy: [desc(calls.createdAt)],
          limit: 1,
        },
      },
    });

    // 7. If no patient is found, throw an error
    if (!existingPatient) {
      throw new Error(`No patient found for phone number: ${phoneNumber}`);
    }

    // 8. Fetch the campaign from the database using the `payload.call.metadata.campaignId`
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, payload.call.metadata.campaignId),
    });

    // 9. If no campaign is found, throw an error
    if (!campaign) {
      throw new Error("Campaign not found");
    }

    // 10. Get the custom post call data specific to the campaign (this is in the campaign config)
    const customPostCallData = campaign.config?.postCall;

    // 11. If no custom post call data is found, throw an error
    if (!customPostCallData) {
      throw new Error("Custom post call data not found");
    }

    // 12. Prepare the post call data
    const postCallData = {
      campaign: customPostCallData.campaign,
      standard: customPostCallData.standard,
    };

    // 13. Assert the type of lastCall to include rowId
    const lastCall = existingPatient?.calls[0] as
      | { rowId?: string }
      | undefined;

    // 14. Define the type of rowRecord
    let rowRecord = null as RowRecord | null;

    // 15. Get the row record
    if (isInbound && existingPatient) {
      if (lastCall?.rowId) {
        rowRecord = (await db.query.rows.findFirst({
          where: eq(rows.id, lastCall.rowId),
          with: {
            run: {
              with: {
                campaign: true,
                organization: true,
              },
            },
          },
        })) as RowRecord | null;
      }
    } else if (!isInbound) {
      // 18. For outbound calls, get row from metadata
      if (!payload.call.metadata?.rowsId) {
        throw new Error("Missing rowsId in call metadata");
      }

      rowRecord = (await db.query.rows.findFirst({
        where: eq(rows.id, payload.call.metadata.rowsId),
        with: {
          run: {
            with: {
              campaign: true,
              organization: true,
            },
          },
        },
      })) as RowRecord | null;
    }

    // 16. If no row record is found, throw an error
    if (!rowRecord) {
      throw new Error("Row not found for call");
    }

    // 17. Prepare call data
    const callData = {
      id: uuidv4(),
      orgId: payload.call.metadata.orgId,
      agentId: payload.call.agent_id,
      direction: payload.call.direction as "inbound" | "outbound",
      status: payload.call.call_status === "ended" ? "completed" : "failed",
      retellCallId: payload.call.call_id,
      patientId: existingPatient?.id,
      runId: payload.call.metadata.runId,
      rowId: payload.call.metadata.rowsId,
      toNumber: payload.call.to_number,
      fromNumber: payload.call.from_number,
      metadata: {
        rowsId: payload.call.metadata.rowsId,
        runId: payload.call.metadata.runId,
        campaignId: payload.call.metadata.campaignId,
        orgId: payload.call.metadata.orgId,
      },
      analysis: {
        ...postCallData.standard.fields.map((field) => ({
          [field.key]: findColumn(payload.call.call_analysis, field.key),
        })),
        ...postCallData.campaign.fields.map((field) => ({
          [field.key]: findColumn(payload.call.call_analysis, field.key),
        })),
      },
      recordingUrl: payload.call.recording_url ?? null,
      duration: Math.floor(payload.call.duration_ms / 1000),
      startTime: new Date(payload.call.start_timestamp),
      endTime: new Date(payload.call.end_timestamp),
    };

    console.log("Creating call with data:", callData);

    // Create call record
    const [call] = await db.insert(calls).values([callData]).returning();

    if (!call) {
      throw new Error("Failed to create call record");
    }

    console.log("Created call record:", call.id);

    // Update row data if this is an outbound call
    if (!isInbound && rowRecord) {
      await db
        .update(rows)
        .set({
          status: "completed",
          postCallData: {
            ...rowRecord.postCallData,
            analysis: {
              transcript: payload.call.call_analysis.transcript ?? null,
              callSummary: payload.call.call_analysis.call_summary ?? null,
              userSentiment: payload.call.call_analysis.user_sentiment ?? null,
              callSuccessful:
                payload.call.call_analysis.call_successful ?? false,
              inVoicemail: payload.call.call_analysis.in_voicemail ?? false,
              callbackRequested: false,
              callbackDateTime: null,
              transferred: false,
              transferReason: null,
              patientQuestions: null,
              patientReached: false,
              detectedAI: false,
              notes: null,
            } as CallAnalysis,
            fromNumber: payload.call.from_number,
            recordingUrl: payload.call.recording_url,
            duration: Math.floor(payload.call.duration_ms / 1000),
            error: undefined,
          },
        })
        .where(eq(rows.id, rowRecord.id));

      // Get current run metadata
      const run = await db.query.runs.findFirst({
        where: eq(runs.id, rowRecord.run.id),
      });

      if (!run) {
        throw new Error("Run not found");
      }

      // Update run metadata with call counts
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
          scheduledTime: "",
          duration: 0,
        },
      };

      const currentMetadata = run.metadata || defaultMetadata;
      const updatedMetadata: RunMetadata = {
        ...currentMetadata,
        calls: {
          ...currentMetadata.calls,
          completed: (currentMetadata.calls?.completed || 0) + 1,
          total: currentMetadata.calls?.total || 0,
          voicemail: payload.call.call_analysis.in_voicemail
            ? (currentMetadata.calls?.voicemail || 0) + 1
            : currentMetadata.calls?.voicemail || 0,
          connected: payload.call.call_analysis.call_successful
            ? currentMetadata.calls?.connected || 0
            : currentMetadata.calls?.connected || 0,
        },
      };

      // Update run metadata
      await db
        .update(runs)
        .set({
          metadata: updatedMetadata,
        })
        .where(eq(runs.id, rowRecord.run.id));

      // Revalidate the run page
      revalidatePath("/campaigns/[campaignId]/runs/[runId]", "page");

      // Emit real-time update
      await pusherServer.trigger(`run-${rowRecord.run.id}`, "call-completed", {
        rowId: rowRecord.id,
        callId: call.id,
      });
    }

    return new Response("OK", { status: 200 });
  } catch (error) {
    console.error("Error processing webhook:", error);
    return new Response(
      `Error processing webhook: ${
        error instanceof Error ? error.message : "Unknown error"
      }`,
      { status: 500 }
    );
  }
}
