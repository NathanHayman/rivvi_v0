"use server";

import { db } from "@/server/db";
import { organizations } from "@/server/db/schema/organizations";
import { users } from "@/server/db/schema/users";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

// Organization Handlers
export async function handleOrganizationCreated(data: any) {
  console.log("handleOrganizationCreated", data);
  try {
    await db.insert(organizations).values({
      id: uuidv4(),
      clerkId: data.id,
      name: data.name,
      phone: process.env.DEFAULT_OUTBOUND_PHONE || "+10000000000",
      timezone: "America/New_York",
    });
    console.log("organization created");
  } catch (error) {
    console.error("Error creating organization", error);
  }
}

export async function handleOrganizationUpdated(data: any) {
  console.log("handleOrganizationUpdated", data);
  try {
    await db
      .update(organizations)
      .set({
        name: data.name,
        phone: data.phone,
        timezone: data.timezone,
        officeHours: data.office_hours,
        concurrentCallLimit: data.concurrent_call_limit,
      })
      .where(eq(organizations.clerkId, data.id));
    console.log("organization updated");
  } catch (error) {
    console.error("Error updating organization", error);
  }
}

export async function handleOrganizationDeleted(data: any) {
  // Soft delete might be better in production
  console.log("handleOrganizationDeleted", data);
  try {
    const org = await db
      .delete(organizations)
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(organizations.clerkId, data.id));
    console.log("organization deleted", org);
  } catch (error) {
    console.error("Error deleting organization", error);
  }
}

// User Handlers
export async function handleUserCreated(data: any) {
  try {
    console.log("handleUserCreated", data);
    const primaryEmail = data.email_addresses?.find(
      (email: any) => email.id === data.primary_email_address_id
    );

    console.log("primaryEmail", primaryEmail);

    const user = await db.insert(users).values({
      id: uuidv4(),
      orgId: "",
      clerkId: data.id,
      email: primaryEmail?.email_address,
      firstName: data.first_name,
      lastName: data.last_name,
      imageUrl: data.image_url,
    });

    console.log("user created", user);
  } catch (error) {
    console.error("Error creating user", error);
  }
}

export async function handleUserUpdated(data: any) {
  console.log("handleUserUpdated", data);
  try {
    const primaryEmail = data.email_addresses?.find(
      (email: any) => email.id === data.primary_email_address_id
    );

    const user = await db
      .update(users)
      .set({
        email: primaryEmail?.email_address,
        firstName: data.first_name,
        lastName: data.last_name,
        imageUrl: data.image_url,
      })
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(users.clerkId, data.id));

    console.log("user updated", user);
  } catch (error) {
    console.error("Error updating user", error);
  }
}

export async function handleUserDeleted(data: any) {
  // Soft delete might be better in production
  console.log("handleUserDeleted", data);
  try {
    await db
      .delete(users)
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(users.clerkId, data.id));
    console.log("user deleted");
  } catch (error) {
    console.error("Error deleting user", error);
  }
}

// Organization Membership Handlers
export async function handleOrgMembershipCreated(data: any) {
  console.log("handleOrgMembershipCreated", data);
  try {
    const org = await db.query.organizations.findFirst({
      where: eq(organizations.clerkId, data.organization.id),
    });

    if (!org) {
      throw new Error("Organization not found");
    }

    const user = await db
      .update(users)
      .set({
        orgId: org.id,
        role: data.role.toLowerCase(),
      })
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(users.clerkId, data.public_user_data.user_id));

    console.log("user updated", user);
  } catch (error) {
    console.error("Error updating user", error);
  }
}

export async function handleOrgMembershipDeleted(data: any) {
  try {
    await db
      .update(users)
      .set({
        role: "user",
      })
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(users.clerkId, data.public_user_data.user_id));
    console.log("user updated");
  } catch (error) {
    console.error("Error updating user", error);
  }
}

export async function handleOrgMembershipUpdated(data: any) {
  try {
    await db
      .update(users)
      .set({
        role: data.role.toLowerCase(),
      })
      // the id coming from clerk is not a uuid, it's a string
      .where(eq(users.clerkId, data.public_user_data.user_id));
  } catch (error) {
    console.error("Error updating user", error);
  }
}

export async function updateOrganization(orgId: string, data: any) {
  try {
    await db.update(organizations).set(data).where(eq(organizations.id, orgId));
    revalidatePath("/admin/orgs", "page");
  } catch (error) {
    console.error("Error updating organization", error);
  }
}
