"use server";

import { db } from "@/server/db";
import { calls, organizations } from "@/server/db/schema";
import { eq } from "drizzle-orm";

export async function getCallById(callId: string) {
  const call = await db.query.calls.findFirst({
    where: eq(calls.id, callId),
  });

  if (!call) {
    throw new Error("Call not found");
  }

  return call;
}

export async function getCallsByOrgId(orgId: string) {
  try {
    if (!orgId) {
      console.error("Organization ID is required");
      throw new Error("Organization ID is required");
    }

    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkId, orgId),
    });

    if (!org) {
      console.error("Organization not found");
      throw new Error("Organization not found");
    }

    const data = await db.query.calls.findMany({
      where: eq(calls.orgId, org.id),
    });

    return data;
  } catch (error) {
    console.error(error);
    throw new Error("Failed to get calls");
  }
}
