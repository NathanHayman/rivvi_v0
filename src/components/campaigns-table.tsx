import { Badge } from "./ui/badge";

import { getRunsForCampaign } from "@/lib/helpers";
import { cn } from "@/lib/utils";
import { campaigns } from "@/server/db/schema";
import Link from "next/link";
import { DeleteCampaignButton } from "./delete-campaign-button";
import { Button, buttonVariants } from "./ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";

type TCampaign = typeof campaigns.$inferSelect;

const CampaignsTable = ({ campaigns }: { campaigns: TCampaign[] }) => {
  if (campaigns.length === 0) {
    return <div>No campaigns found</div>;
  }

  return (
    <Table className="w-full">
      <TableHeader className="px-4">
        <TableRow className="px-4">
          <TableHead className="px-4">Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Most Recent Run</TableHead>
          <TableHead>Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody className="">
        {campaigns.map(async (campaign) => {
          const mostRecentRun = await getRunsForCampaign(campaign.id);
          return (
            <TableRow key={campaign.id} className="[&>td]:py-4">
              <TableCell>{campaign.name}</TableCell>
              <TableCell>
                <Badge variant="neutral_outline">{campaign.type}</Badge>
              </TableCell>
              <TableCell>
                {mostRecentRun ? (
                  <Badge
                    variant={
                      mostRecentRun[0]?.status === "running"
                        ? "success_solid_outline"
                        : "neutral_solid"
                    }
                  >
                    {mostRecentRun[0]?.status === "running"
                      ? "Active"
                      : "Inactive"}
                  </Badge>
                ) : (
                  <Badge variant="neutral_outline">No runs yet</Badge>
                )}
              </TableCell>
              <TableCell>
                {mostRecentRun ? (
                  <Link
                    prefetch={false}
                    href={`/campaigns/${campaign.id}/runs/${mostRecentRun[0]?.id}`}
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" })
                    )}
                  >
                    {mostRecentRun[0]?.status === "running"
                      ? "View Active Run"
                      : "View Most Recent Run"}
                  </Link>
                ) : (
                  <Button variant="link" size="sm" disabled>
                    You haven&apos;t run this campaign yet
                  </Button>
                )}
              </TableCell>
              <TableCell className="max-w-36">
                <Link
                  prefetch={false}
                  href={`/campaigns/${campaign.id}`}
                  className={cn(
                    buttonVariants({ variant: "default", size: "sm" })
                  )}
                >
                  View
                </Link>
              </TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <button
                    className={cn(
                      buttonVariants({ variant: "link", size: "sm" })
                    )}
                  >
                    Edit
                  </button>
                  <DeleteCampaignButton campaign={campaign} />
                </div>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default CampaignsTable;
