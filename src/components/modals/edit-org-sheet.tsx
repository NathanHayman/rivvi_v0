"use client";

import { Organization } from "@/server/db/schema";
import { Dispatch, SetStateAction } from "react";
import EditOrgForm from "../forms/edit-org-form";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface EditOrgSheetProps {
  org: Organization;
  children?: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const EditOrgSheet = (props: EditOrgSheetProps) => {
  return (
    <Sheet open={props.showModal} onOpenChange={props.setShowModal}>
      <SheetContent side="right" className="w-full">
        <SheetHeader>
          <SheetTitle>Edit organization</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-4">
          <EditOrgForm
            org={props.org}
            showModal={props.showModal}
            setShowModal={props.setShowModal}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export { EditOrgSheet };
