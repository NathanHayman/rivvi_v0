"use client";

import { cn } from "@/lib/utils";
import { useOrganization } from "@clerk/nextjs";
import { Settings } from "lucide-react";
import Link from "next/link";
import { buttonVariants } from "./ui/button";

const SUPER_ADMIN_ORGANIZATION_ID =
  process.env.NEXT_PUBLIC_SUPER_ADMIN_ORGANIZATION_ID;

export function SuperAdminWidget() {
  const organization = useOrganization();

  if (organization?.organization?.id !== SUPER_ADMIN_ORGANIZATION_ID) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-0 left-0 flex justify-center z-50">
      <Link
        href="/admin"
        className={cn(buttonVariants({ variant: "outline" }), "rounded-full")}
      >
        <Settings />
        <span className="sr-only">Admin</span>
        Super Admin Dashboard
      </Link>
    </div>
  );
}
