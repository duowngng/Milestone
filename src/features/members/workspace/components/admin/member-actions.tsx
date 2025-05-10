"use client";

import { toast } from "sonner";
import { CopyIcon, EditIcon, TrashIcon } from "lucide-react";

import { useConfirm } from "@/hooks/use-confirm";
import { useEditMemberModal } from "../../hooks/use-edit-member-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useDeleteMember } from "../../api/admin/use-delete-admin-member";

interface MemberActionsProps {
  id: string;
  children: React.ReactNode;
}

export const MemberActions = ({ id, children }: MemberActionsProps) => {
  const { mutate, isPending } = useDeleteMember();
  const { open } = useEditMemberModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Member",
    "Are you sure you want to delete this member?",
    "destructive"
  );

  const onDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate({ param: { memberId: id } });
  };

  const onCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success("Member ID copied to clipboard");
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={onCopyId} className="font-medium p-[10px]">
            <CopyIcon className="size-4 mr-2 stroke-2" />
            Copy ID
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => open(id)}
            className="font-medium p-[10px]"
          >
            <EditIcon className="size-4 mr-2 stroke-2" />
            Edit Member
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className="text-red-700 focus:text-red-700 font-medium p-[10px]"
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete Member
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
