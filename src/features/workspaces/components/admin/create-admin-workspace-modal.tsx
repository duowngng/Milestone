"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateAdminWorkspaceFormWrapper } from "./create-admin-workspace-form-wrapper";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";

export const CreateAdminWorkspaceModal = () => {
  const { isOpen, setIsOpen, close } = useCreateWorkspaceModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAdminWorkspaceFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
