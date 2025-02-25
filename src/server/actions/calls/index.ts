import { retell } from "@/lib/retell-client";
import { db } from "@/server/db";
import { calls } from "@/server/db/schema";
import { CallMetadata, Variables } from "@/types/zod";
import { z } from "zod";
import { createCallSchema, dispatchCallSchema } from "./schema";

export async function createCall(props: z.infer<typeof createCallSchema>) {
  const { to, from, agentId, metadata, variables } = props;

  // Create the call in Retell using the SDK
  const retellCall = await retell.call.createPhoneCall({
    to_number: to,
    from_number: from,
    override_agent_id: agentId,
    retell_llm_dynamic_variables: variables,
    metadata: metadata,
  });

  return retellCall;
}

export async function dispatchCall(props: z.infer<typeof dispatchCallSchema>) {
  const { to, from, agentId, metadata, variables } = props;

  // Create the call in Retell using the SDK
  const retellCall = await retell.call.createPhoneCall({
    to_number: to,
    from_number: from,
    override_agent_id: agentId,
    retell_llm_dynamic_variables: variables,
    metadata: metadata,
  });

  // If the call was not created, throw an error
  if (!retellCall.call_id) {
    throw new Error("Failed to create call");
  }

  // Create the call in the database
  const call = await db.insert(calls).values({
    orgId: "123",
    patientId: "123",
    agentId,
    direction: "outbound",
    status: "pending",
    retellCallId: retellCall.call_id,
    toNumber: to,
    fromNumber: from,
    metadata: metadata as CallMetadata,
    disconnectionReason: null,
    variables: variables as unknown as Variables,
  });

  if (!call) {
    throw new Error("Failed to create call");
  }

  return retellCall;
}
