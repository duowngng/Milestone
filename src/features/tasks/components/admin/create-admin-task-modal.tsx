"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useCreateTaskModal } from "../../hooks/use-create-task-modal";
import { CreateAdminTaskFormWrapper } from "./create-admin-task-form-wrapper";

export const CreateAdminTaskModal = () => {
  const { isOpen, close, initialStatus, initialProjectId } =
    useCreateTaskModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <CreateAdminTaskFormWrapper
        onCancel={close}
        initialStatus={initialStatus ?? undefined}
        initialProjectId={initialProjectId ?? undefined}
      />
    </ResponsiveModal>
  );
};
