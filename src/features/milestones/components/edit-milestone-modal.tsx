"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useEditMilestoneModal } from "../hooks/use-edit-milestone-modal";
import { EditMilestoneFormWrapper } from "./edit-milestone-form-wrapper";

export const EditMilestoneModal = () => {
  const { milestoneId, close } = useEditMilestoneModal();

  return (
    <ResponsiveModal open={!!milestoneId} onOpenChange={close}>
      {milestoneId && (
        <EditMilestoneFormWrapper id={milestoneId} onCancel={close} />
      )}
    </ResponsiveModal>
  );
};
