"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateAdminMemberFormWrapper } from "./create-admin-member-form-wrapper";
import { useCreateMemberModal } from "@/features/members/hooks/use-create-member-modal";

export const CreateAdminMemberModal = () => {
  const { isOpen, setIsOpen, close } = useCreateMemberModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAdminMemberFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
