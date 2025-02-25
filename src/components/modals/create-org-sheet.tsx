"use client";

import { Dispatch, SetStateAction } from "react";
import CreateOrgForm from "../forms/create-org-form";
import { ScrollArea } from "../ui/scroll-area";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../ui/sheet";

interface CreateOrgSheetProps {
  children?: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

const CreateOrgSheet = (props: CreateOrgSheetProps) => {
  return (
    <Sheet open={props.showModal} onOpenChange={props.setShowModal}>
      <SheetContent side="right" className="w-full">
        <SheetHeader>
          <SheetTitle>Create a new organization</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-full mt-4">
          <CreateOrgForm
            showModal={props.showModal}
            setShowModal={props.setShowModal}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};

export { CreateOrgSheet };
