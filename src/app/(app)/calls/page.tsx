import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CallsTable } from "@/components/tables/calls-table";
import { getQueryClient } from "@/lib/query-client";
import { auth } from "@clerk/nextjs/server";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "Calls - Rivvi",
  description: "Calls for Rivvi's human-like conversational AI for healthcare.",
};

export default async function Calls() {
  const { orgId } = await auth();

  if (!orgId) {
    return redirect("/");
  }

  const dehydratedState = dehydrate(getQueryClient());

  return (
    <HydrationBoundary state={dehydratedState}>
      <AppPage>
        <AppBreadcrumbs breadcrumbs={[{ title: "Calls", href: "/" }]} />
        <AppBody>
          <AppHeader title="Calls" />
          <AppContent className="h-full">
            <div className="">
              <Suspense fallback={<div>Loading...</div>}>
                <CallsTable orgId={orgId as string} />
              </Suspense>
            </div>
          </AppContent>
        </AppBody>
      </AppPage>
    </HydrationBoundary>
  );
}
