"use client";

import { ResponsiveModal } from "@/components/responsive-modal";
import { EditAdminMemberFormWrapper } from "./edit-admin-member-form-wrapper";
import { useEditMemberModal } from "@/features/members/hooks/use-edit-member-modal";

export const EditAdminMemberModal = () => {
  const { close, memberId } = useEditMemberModal();

  if (!memberId) {
    return null;
  }

  return (
    <ResponsiveModal open={!!memberId} onOpenChange={close}>
      {memberId && (
        <EditAdminMemberFormWrapper id={memberId} onCancel={close} />
      )}
    </ResponsiveModal>
  );
};
