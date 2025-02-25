"use client";

import { Campaign } from "@/server/db/schema";
import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateRunSheet } from "./create-run-modal";

interface CreateRunModalButtonProps {
  className?: string;
  campaign: Campaign;
}

const CreateRunModalButton = ({
  className,
  campaign,
}: CreateRunModalButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4" />
        Create a new run
      </Button>
      {/* <CreateRunModal
          campaignId={campaignId}
          showModal={showModal}
        setShowModal={setShowModal}
      /> */}
      <CreateRunSheet
        campaign={campaign}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export { CreateRunModalButton };
