import CampaignsTable from "@/components/campaigns-table";
import {
  AppBody,
  AppBreadcrumbs,
  AppContent,
  AppHeader,
  AppPage,
} from "@/components/layout/shell";
import { Button } from "@/components/ui/button";
import { db } from "@/server/db";
import { campaigns, organizations } from "@/server/db/schema";
import { auth } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { Metadata } from "next";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Campaigns - Rivvi",
  description:
    "Campaigns for Rivvi's human-like conversational AI for healthcare.",
};

async function getOrgByClerkId(clerkId: string) {
  const org = await db.query.organizations.findFirst({
    where: eq(organizations.clerkId, clerkId),
  });

  return org;
}

export default async function CampaignsPage() {
  const { orgId } = await auth();

  if (!orgId) {
    return redirect("/");
  }

  const org = await getOrgByClerkId(orgId);

  if (!org) {
    return redirect("/org-selection");
  }

  const data = await db.query.campaigns.findMany({
    where: eq(campaigns.orgId, org.id),
  });

  return (
    <AppPage>
      <AppBreadcrumbs
        breadcrumbs={[{ title: "Campaigns", href: "/campaigns" }]}
      />
      <AppBody maxWidth="max-w-screen-xl">
        <AppHeader
          className=""
          title="Campaigns"
          buttons={
            <Button variant="default" size="sm">
              Request a new campaign
            </Button>
          }
        />
        <AppContent className="">
          <CampaignsTable campaigns={data} />
        </AppContent>
      </AppBody>
    </AppPage>
  );
}
