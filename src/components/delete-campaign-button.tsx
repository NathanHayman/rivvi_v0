"use client";

import { Button } from "@/components/ui/button";
import { deleteCampaign } from "@/server/actions/campaigns";
import { TCampaign } from "@/types";

export function DeleteCampaignButton({ campaign }: { campaign: TCampaign }) {
  return (
    <Button
      variant="link"
      size="sm"
      onClick={() => {
        deleteCampaign(campaign.id);
      }}
    >
      Delete
    </Button>
  );
}
