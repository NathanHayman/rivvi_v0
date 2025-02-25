import CampaignsTable from "@/components/campaigns-table";
import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CreateCampaignSheetButton } from "@/components/modals/create-campaign-modal-button";
import { db } from "@/server/db";
import { campaigns } from "@/server/db/schema";
import { eq } from "drizzle-orm";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Campaigns - Rivvi",
  description:
    "Campaigns for Rivvi's human-like conversational AI for healthcare.",
};

type PageProps = {
  params: Promise<{ orgId: string }>;
};

export default async function CampaignsPage({ params }: PageProps) {
  const { orgId } = await params;

  const data = await db.query.campaigns.findMany({
    where: eq(campaigns.orgId, orgId),
  });

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Organizations", href: "/admin/orgs" },
          { title: orgId, href: `/admin/orgs/${orgId}` },
          { title: "Campaigns", href: `/admin/orgs/${orgId}/campaigns` },
        ]}
      />
      <AppBody maxWidth="max-w-screen-xl">
        <AppHeader
          className=""
          title="Campaigns"
          buttons={<CreateCampaignSheetButton orgId={orgId} />}
        />
        <AppContent className="">
          <CampaignsTable campaigns={data} />
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
