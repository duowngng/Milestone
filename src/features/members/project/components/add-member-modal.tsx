"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useAddMembersModal } from "../hooks/use-add-members-modal";
import { AddMemberFormWrapper } from "./add-member-form-wrapper";

export const AddMemberModal = () => {
  const { isOpen, close } = useAddMembersModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <AddMemberFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
