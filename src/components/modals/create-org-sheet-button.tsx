"use client";

import { Plus } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { CreateOrgSheet } from "./create-org-sheet";

interface CreateOrgSheetButtonProps {
  className?: string;
}

const CreateOrgSheetButton = ({ className }: CreateOrgSheetButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button className={className} onClick={() => setShowModal(true)}>
        <Plus className="w-4 h-4" />
        Create a new organization
      </Button>
      {/* <CreateRunModal
          campaignId={campaignId}
          showModal={showModal}
        setShowModal={setShowModal}
      /> */}
      <CreateOrgSheet showModal={showModal} setShowModal={setShowModal} />
    </>
  );
};

export { CreateOrgSheetButton };
