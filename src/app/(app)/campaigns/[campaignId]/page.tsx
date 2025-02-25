import CampaignOverview from "@/components/campaign-overview";
import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CreateRunModalButton } from "@/components/modals/create-run-modal-button";
import RecentRunsList from "@/components/recent-runs-list";
import { SummaryCards } from "@/components/summary-cards";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { db } from "@/server/db";
import { campaigns, runs } from "@/server/db/schema";
import { desc, eq } from "drizzle-orm";
import { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaign Details - Rivvi",
  description:
    "Campaign details for Rivvi's human-like conversational AI for healthcare.",
};

type PageProps = {
  params: Promise<{ campaignId: string }>;
};

export default async function CampaignPage({ params }: PageProps) {
  const { campaignId } = await params;
  const campaign = await db.query.campaigns.findFirst({
    where: eq(campaigns.id, campaignId),
    with: {
      organization: true,
    },
  });

  if (!campaign) {
    return notFound();
  }

  const recentRuns = await db.query.runs.findMany({
    where: eq(runs.campaignId, campaignId),
    orderBy: [desc(runs.createdAt)],
    limit: 5,
  });

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Campaigns", href: "/campaigns" },
          { title: campaign.name, href: `/campaigns/${campaignId}` },
        ]}
      />
      <AppBody maxWidth="max-w-screen-xl">
        <AppHeader
          className=""
          title={campaign.name}
          buttons={
            <>
              <Link
                prefetch={false}
                href={`/campaigns/${campaignId}/runs`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Runs
              </Link>
              <CreateRunModalButton campaign={campaign} />
            </>
          }
        />
        <AppContent className="space-y-10">
          {/* Campaign Statistics */}
          <SummaryCards
            cards={[
              {
                title: "Total Confirmed",
                value: "0",
              },
              { title: "Total Calls", value: "0" },
              { title: "Success Rate", value: "0%" },
              {
                title: "Total Runs",
                value: "0",
              },
            ]}
          />
          <div className="grid lg:grid-cols-5 gap-4 lg:gap-8">
            {/* Recent Runs */}
            <RecentRunsList runs={recentRuns} className="col-span-3 order-2" />
            {/* Campaign Description */}
            <CampaignOverview
              campaign={campaign}
              className="col-span-2 sm:mt-11"
            >
              <p className="text-sm text-muted-foreground">insdafasdf</p>
            </CampaignOverview>
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
