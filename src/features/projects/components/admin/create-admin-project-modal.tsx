"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { CreateAdminProjectFormWrapper } from "./create-admin-project-form-wrapper";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";

export const CreateAdminProjectModal = () => {
  const { isOpen, setIsOpen, close } = useCreateProjectModal();

  return (
    <ResponsiveModal open={isOpen} onOpenChange={setIsOpen}>
      <CreateAdminProjectFormWrapper onCancel={close} />
    </ResponsiveModal>
  );
};
