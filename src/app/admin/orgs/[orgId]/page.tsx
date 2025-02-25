import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { CreateCampaignSheetButton } from "@/components/modals/create-campaign-modal-button";
import { EditOrgSheetButton } from "@/components/modals/edit-org-sheet-button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getCampaignsByOrgId } from "@/server/queries/campaigns";
import { getOrganization } from "@/server/queries/organizations";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";

type PageProps = {
  params: Promise<{ orgId: string }>;
};

async function CampaignsList({ orgId }: { orgId: string }) {
  const campaigns = await getCampaignsByOrgId({ orgId });

  return (
    <div className="flex flex-col gap-2 max-h-[300px] overflow-y-auto max-w-xl">
      {campaigns.map((campaign) => (
        <Link
          key={campaign.id}
          href={`/admin/orgs/${orgId}/campaigns/${campaign.id}`}
        >
          <Card className="rounded-xl bg-card dark:bg-zinc-900/60 border shadow-none relative hover:bg-accent/50 transition-colors">
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-medium">{campaign.name}</CardTitle>
              <CardDescription>
                {campaign.createdAt?.toLocaleDateString()}
              </CardDescription>
              <Badge className="w-fit" variant="secondary">
                {campaign.direction}
              </Badge>
            </CardHeader>
          </Card>
        </Link>
      ))}
    </div>
  );
}

export default async function OrgPage({ params }: PageProps) {
  const { orgId } = await params;

  const org = await getOrganization({ id: orgId });

  if (!org) {
    return notFound();
  }

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[
          { title: "Overview", href: "/" },
          { title: "Organizations", href: "/admin/orgs" },
          { title: org.name, href: `/admin/orgs/${org.id}` },
        ]}
      />
      <AppBody>
        <AppHeader
          title={org.name}
          buttons={<EditOrgSheetButton org={org} />}
        />
        <AppContent className="h-full flex flex-col gap-4 lg:p-4">
          {/* Show recent campaigns */}
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row justify-between max-w-xl gap-2">
              <h2 className="text-xl font-semibold">Campaigns</h2>
              <CreateCampaignSheetButton orgId={orgId} />
            </div>
            <Suspense fallback={<div>Loading...</div>}>
              <CampaignsList orgId={orgId} />
            </Suspense>
          </div>
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
