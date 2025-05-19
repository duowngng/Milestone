"use client";

import { ResponsiveModal } from "@/components/responsive-modal";

import { useCreateMilestoneModal } from "../hooks/use-create-milestone-modal";
import { CreateMilestoneFormWrapper } from "./create-milestone-form-wrapper";

export const CreateMilestoneModal = () => {
  const { isOpen, close, initialDate } = useCreateMilestoneModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={(open) => !open && close()}>
      <CreateMilestoneFormWrapper
        onCancel={close}
        initialDate={initialDate ?? undefined}
      />
    </ResponsiveModal>
  );
};
