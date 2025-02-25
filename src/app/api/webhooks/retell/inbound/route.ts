import { formatProvider, formatTime } from "@/lib/helpers/process-data";
import { db } from "@/server/db";
import { calls, patients, rows } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";

export async function POST(req: Request) {
  try {
    // 1. Get the phone number from the request
    const payload = await req.json();
    const phoneNumber = payload.from_number;

    // 2. Search for the patient by phone number
    const patient = await db.query.patients.findFirst({
      where: eq(patients.primaryPhone, phoneNumber),
      with: {
        calls: {
          orderBy: [desc(calls.createdAt)],
          limit: 5,
          with: {
            row: {
              with: {
                run: {
                  with: {
                    campaign: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 3. If no patient is found, return a response indicating the caller is new
    if (!patient) {
      return new Response(
        JSON.stringify({
          is_existing_patient: "false",
          context: "New caller, no previous interactions found",
        }),
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // 4. Get the active row for the patient
    const activeRow = await db.query.rows.findFirst({
      where: eq(rows.patientId, patient.id),
      with: {
        run: {
          with: {
            campaign: true,
          },
        },
      },
      orderBy: [desc(rows.createdAt)],
    });

    const lastCompletedCall = patient.calls.find(
      (call) => call.status === "completed"
    );

    // Build completely flat response with explicit assignments
    const response = {
      // Basic patient info
      is_existing_patient: "true",
      first_name: patient.firstName || "",
      last_name: patient.lastName || "",
      dob: patient.dob || "",
      phone: patient.primaryPhone || "",

      // Campaign info (completely flat)
      last_interaction: lastCompletedCall?.endTime
        ? new Date(lastCompletedCall.endTime).toLocaleDateString()
        : "none",
      last_campaign_type: lastCompletedCall?.row?.run?.campaign?.name || "none",
      has_pending_callback: activeRow ? "true" : "false",
      active_campaign_name: activeRow?.run?.campaign?.name || "none",
      active_campaign_id: activeRow?.run?.campaign?.id || "none",
      last_call_outcome: lastCompletedCall?.analysis?.callSummary || "none",

      // Active campaign variables (if they exist)
      appointment_date:
        activeRow?.variables?.campaign?.appointment_date ||
        activeRow?.variables?.campaign?.appt_date ||
        "",
      appointment_time:
        activeRow?.variables?.campaign?.appointment_time ||
        activeRow?.variables?.campaign?.appt_time ||
        "",
      appointment_type:
        activeRow?.variables?.campaign?.appointment_type ||
        activeRow?.variables?.campaign?.appt_type ||
        "",
      appointment_provider:
        activeRow?.variables?.campaign?.appointment_provider ||
        activeRow?.variables?.campaign?.appt_provider ||
        "",
      appointment_location:
        activeRow?.variables?.campaign?.appointment_location ||
        activeRow?.variables?.campaign?.appt_location ||
        "",
    };

    if (response.appointment_time) {
      response.appointment_time = formatTime(response.appointment_time);
    }

    if (response.appointment_provider) {
      response.appointment_provider = formatProvider(
        response.appointment_provider
      );
    }

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error processing inbound webhook:", error);
    return new Response(
      JSON.stringify({
        is_existing_patient: "false",
        error_message: "Failed to process request",
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
