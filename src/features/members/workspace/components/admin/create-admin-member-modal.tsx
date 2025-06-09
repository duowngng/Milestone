"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateAdminMemberFormWrapper } from "./create-admin-member-form-wrapper";
import { useCreateMemberModal } from "@/features/members/workspace/hooks/use-create-member-modal";

export const CreateAdminMemberModal = () => {
  const { isOpen, setIsOpen, close, initialWorkspaceId } =
    useCreateMemberModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAdminMemberFormWrapper
        onCancel={close}
        initialWorkspaceId={initialWorkspaceId ?? undefined}
      />
    </ResponsiveModal>
  );
};
