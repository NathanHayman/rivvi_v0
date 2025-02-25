"use client";

import { Campaign } from "@/server/db/schema";
import { Dispatch, SetStateAction } from "react";
import { CreateRunForm } from "../forms/create-run-form";
import { Modal, ModalBody } from "../ui/modal";

interface ModalProps {
  children?: React.ReactNode;
  showModal: boolean;
  setShowModal: Dispatch<SetStateAction<boolean>>;
}

interface CreateRunModalProps extends ModalProps {
  campaign: Campaign;
}

const CreateRunModal = (props: CreateRunModalProps) => {
  return (
    <Modal showModal={props.showModal} setShowModal={props.setShowModal}>
      {/* <ModalHeader>
        <ModalTitle>Create a new run for {props.campaignId}</ModalTitle>
      </ModalHeader> */}
      <ModalBody className="sm:pt-4">
        <CreateRunForm
          campaign={props.campaign}
          open={props.showModal}
          onOpenChange={props.setShowModal}
        />
      </ModalBody>
    </Modal>
  );
};

const CreateRunSheet = (props: CreateRunModalProps) => {
  return (
    <CreateRunForm
      campaign={props.campaign}
      open={props.showModal}
      onOpenChange={props.setShowModal}
    />
  );
};

export { CreateRunModal, CreateRunSheet };
