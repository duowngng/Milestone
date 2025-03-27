"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CopyIcon, TrashIcon } from "lucide-react";

import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useDeleteAdminWorkspace } from "@/features/workspaces/api/admin/use-delete-admin-workspace";

interface WorkspaceActionsProps {
  id: string;
  children: React.ReactNode;
}

export const WorkspaceActions = ({ id, children }: WorkspaceActionsProps) => {
  const router = useRouter();
  const { mutate, isPending } = useDeleteAdminWorkspace();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Workspace",
    "Are you sure you want to delete this workspace?",
    "destructive"
  );

  const onDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate(
      { param: { workspaceId: id } },
      {
        onSuccess: () => {
          router.refresh();
        },
      }
    );
  };

  const onCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success("Workspace ID copied to clipboard");
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
            onClick={onDelete}
            disabled={isPending}
            className="text-red-700 focus:text-red-700 font-medium p-[10px]"
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete Workspace
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
