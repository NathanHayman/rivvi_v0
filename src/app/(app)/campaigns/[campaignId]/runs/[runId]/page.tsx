import { RunPageClient } from "@/components/run-page";
import { db } from "@/server/db";
import { runs } from "@/server/db/schema";
import {
  HydrationBoundary,
  QueryClient,
  dehydrate,
} from "@tanstack/react-query";
import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";

type PageProps = {
  params: Promise<{ campaignId: string; runId: string }>;
};

async function getInitialRun(runId: string) {
  const run = await db.query.runs.findFirst({
    where: eq(runs.id, runId),
    with: {
      campaign: true,
      rows: true,
    },
  });

  if (!run || !run.campaign) return null;
  return run;
}

export default async function RunPage({ params }: PageProps) {
  const { campaignId, runId } = await params;

  // Create a new QueryClient instance
  const queryClient = new QueryClient();

  // Prefetch the run data using server-side data fetching
  const initialData = await getInitialRun(runId);

  if (!initialData) return notFound();

  // Set the initial data in the query client
  queryClient.setQueryData(["run", runId], initialData);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <RunPageClient runId={runId} />
    </HydrationBoundary>
  );
}
