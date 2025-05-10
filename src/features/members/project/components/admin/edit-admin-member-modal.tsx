"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { EditAdminProjectMemberFormWrapper } from "./edit-admin-member-form-wrapper";
import { useEditProjectMemberModal } from "../../hooks/use-edit-project-member-modal";

export const EditAdminProjectMemberModal = () => {
  const { close, memberId } = useEditProjectMemberModal();

  if (!memberId) {
    return null;
  }

  return (
    <ResponsiveModal open={!!memberId} onOpenChange={close}>
      {memberId && (
        <EditAdminProjectMemberFormWrapper id={memberId} onCancel={close} />
      )}
    </ResponsiveModal>
  );
};
