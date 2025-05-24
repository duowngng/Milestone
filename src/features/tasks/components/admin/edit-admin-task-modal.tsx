"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useEditTaskModal } from "../../hooks/use-edit-task-modal";
import { EditAdminTaskFormWrapper } from "./edit-admin-task-form-wrapper";

export const EditAdminTaskModal = () => {
  const { taskId, close } = useEditTaskModal();

  return (
    <ResponsiveModal open={!!taskId} onOpenChange={close}>
      {taskId && <EditAdminTaskFormWrapper id={taskId} onCancel={close} />}
    </ResponsiveModal>
  );
};
