"use client";

import { Organization } from "@/server/db/schema";
import { Pencil } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { EditOrgSheet } from "./edit-org-sheet";

interface EditOrgSheetButtonProps {
  org: Organization;
  className?: string;
}

const EditOrgSheetButton = ({ org, className }: EditOrgSheetButtonProps) => {
  const [showModal, setShowModal] = useState(false);

  return (
    <>
      <Button
        className={className}
        onClick={() => setShowModal(true)}
        variant="outline"
        size="sm"
      >
        <Pencil className="w-4 h-4" />
        Edit
      </Button>
      <EditOrgSheet
        org={org}
        showModal={showModal}
        setShowModal={setShowModal}
      />
    </>
  );
};

export { EditOrgSheetButton };
