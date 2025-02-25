// app/api/webhooks/clerk/route.ts
import {
  handleOrganizationCreated,
  handleOrganizationDeleted,
  handleOrganizationUpdated,
  handleOrgMembershipCreated,
  handleOrgMembershipDeleted,
  handleOrgMembershipUpdated,
  handleUserCreated,
  handleUserDeleted,
  handleUserUpdated,
} from "@/server/actions/organizations";
import { WebhookEvent } from "@clerk/nextjs/server";
import { headers } from "next/headers";
import { Webhook } from "svix";

export async function POST(req: Request) {
  // Get the headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  // If there are no headers, error out
  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Error occured -- no svix headers", {
      status: 400,
    });
  }

  // Get the body
  const payload = await req.json();
  const body = JSON.stringify(payload);

  // Create a new Svix instance with your webhook secret
  const wh = new Webhook(process.env.CLERK_WEBHOOK_SECRET || "");

  let evt: WebhookEvent;

  // Verify the payload with the headers
  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error("Error verifying webhook:", err);
    return new Response("Error occured", {
      status: 400,
    });
  }

  // Handle the webhook
  try {
    switch (evt.type) {
      case "organization.created":
        await handleOrganizationCreated(evt.data);
        break;
      case "organization.updated":
        await handleOrganizationUpdated(evt.data);
        break;
      case "organization.deleted":
        await handleOrganizationDeleted(evt.data);
        break;
      case "user.created":
        await handleUserCreated(evt.data);
        break;
      case "user.updated":
        await handleUserUpdated(evt.data);
        break;
      case "user.deleted":
        await handleUserDeleted(evt.data);
        break;
      case "organizationMembership.created":
        await handleOrgMembershipCreated(evt.data);
        break;
      case "organizationMembership.deleted":
        await handleOrgMembershipDeleted(evt.data);
        break;
      case "organizationMembership.updated":
        await handleOrgMembershipUpdated(evt.data);
        break;
    }

    return new Response("Success", { status: 200 });
  } catch (err) {
    console.error("Error handling webhook:", err);
    return new Response("Error occurred", { status: 500 });
  }
}
