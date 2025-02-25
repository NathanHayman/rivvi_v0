"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import {
  CreateCampaignModal,
  CreateCampaignSheet,
} from "./create-campaign-modal";

interface CreateCampaignModalButtonProps {
  className?: string;
  orgId: string;
}

const CreateCampaignModalButton = ({
  className,
  orgId,
}: CreateCampaignModalButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4" />
        Create a new run
      </Button>
      <CreateCampaignModal
        showModal={showModal}
        setShowModal={setShowModal}
        orgId={orgId}
      />
    </>
  );
};

const CreateCampaignSheetButton = ({
  className,
  orgId,
}: CreateCampaignModalButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className={className}
        onClick={() => setShowModal(true)}
        variant="default"
        size="sm"
      >
        <Plus className="w-4 h-4" />
        Create a new campaign
      </Button>
      <CreateCampaignSheet
        showModal={showModal}
        setShowModal={setShowModal}
        orgId={orgId}
      />
    </>
  );
};

export { CreateCampaignModalButton, CreateCampaignSheetButton };
