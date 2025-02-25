"use client";

import { Dispatch, SetStateAction } from "react";
import { CreateCampaignForm } from "../forms/create-campaign-form";
import { Modal, ModalBody, ModalHeader, ModalTitle } from "../ui/modal";
import { Sheet, SheetContent } from "../ui/sheet";

interface ModalProps {
  children?: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface CreateCampaignModalProps extends ModalProps {
  orgId: string;
}

const CreateCampaignModal = (props: CreateCampaignModalProps) => {
  return (
    <Modal showModal={props.showModal} setShowModal={props.setShowModal}>
      <ModalHeader>
        <ModalTitle>Create a new campaign</ModalTitle>
      </ModalHeader>
      <ModalBody className="sm:pt-4">
        <p>Create a new campaign to start sending emails.</p>
      </ModalBody>
    </Modal>
  );
};

const CreateCampaignSheet = (props: CreateCampaignModalProps) => {
  return (
    <Sheet open={props.showModal} onOpenChange={props.setShowModal}>
      <SheetContent className="max-w-xl px-4">
        <CreateCampaignForm
          open={props.showModal}
          onOpenChange={props.setShowModal}
          orgId={props.orgId}
        />
      </SheetContent>
    </Sheet>
  );
};

export { CreateCampaignModal, CreateCampaignSheet };
