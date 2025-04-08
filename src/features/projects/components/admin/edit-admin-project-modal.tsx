"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { EditAdminProjectFormWrapper } from "./edit-admin-project-form-wrapper";
import { useEditProjectModal } from "@/features/projects/hooks/use-edit-project-modal";

export const EditAdminProjectModal = () => {
  const { close, projectId } = useEditProjectModal();

  if (!projectId) {
    return null;
  }

  return (
    <ResponsiveModal open={!!projectId} onOpenChange={close}>
      {projectId && (
        <EditAdminProjectFormWrapper id={projectId} onCancel={close} />
      )}
    </ResponsiveModal>
  );
};
