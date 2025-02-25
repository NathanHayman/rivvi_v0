import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CreateRunModalButton } from "@/components/modals/create-run-modal-button";
import RunsTable from "@/components/runs-table";
import { db } from "@/server/db";
import { campaigns, runs } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaign Runs - Rivvi",
  description:
    "Campaign runs for Rivvi's human-like conversational AI for healthcare.",
};

interface PageProps {
  params: Promise<{ campaignId: string }>;
}

export default async function CampaignRunsPage({ params }: PageProps) {
  const { campaignId } = await params;
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
  });

  if (!campaign) {
    return notFound();
  }

  const campaignRuns = await db.query.runs.findMany({
    where: eq(runs.campaignId, campaignId),
  });

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
          { title: "Runs", href: `/campaigns/${campaignId}/runs` },
        ]}
      />
      <AppBody>
        <AppHeader
          className=""
          title={`${campaign.name} - Runs`}
          buttons={<CreateRunModalButton campaign={campaign} />}
        />
        <AppContent>
          <RunsTable runs={campaignRuns} />
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
