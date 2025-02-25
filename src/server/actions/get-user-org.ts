"use server";

import { db } from "@/server/db";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { users } from "../db/schema";

export async function getUserOrg() {
  const { userId } = await auth(); // Get current user ID from Clerk
  if (!userId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, userId),
    with: { organization: true },
  });

  console.log(user);

  return user?.organization || null;
}
