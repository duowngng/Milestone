"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { EditAdminWorkspaceFormWrapper } from "./edit-admin-workspace-form-wrapper";
import { useEditWorkspaceModal } from "@/features/workspaces/hooks/use-edit-workspace-modal";

export const EditAdminWorkspaceModal = () => {
  const { close, workspaceId } = useEditWorkspaceModal();

  if (!workspaceId) {
    return null;
  }

  return (
    <ResponsiveModal open={!!workspaceId} onOpenChange={close}>
      {workspaceId && (
        <EditAdminWorkspaceFormWrapper id={workspaceId} onCancel={close} />
      )}
    </ResponsiveModal>
  );
};
