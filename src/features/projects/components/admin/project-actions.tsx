"use client";

import { toast } from "sonner";
import { CopyIcon, EditIcon, TrashIcon, UserPlusIcon } from "lucide-react";

import { useConfirm } from "@/hooks/use-confirm";
import { useEditProjectModal } from "@/features/projects/hooks/use-edit-project-modal";
import { useAddMembersModal } from "@/features/members/project/hooks/use-add-members-modal";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useDeleteProject } from "@/features/projects/api/admin/use-delete-admin-project";

interface ProjectActionsProps {
  id: string;
  children: React.ReactNode;
}

export const ProjectActions = ({ id, children }: ProjectActionsProps) => {
  const { mutate, isPending } = useDeleteProject();
  const { open } = useEditProjectModal();
  const { open: openAddMembers, setInitialProjectId } = useAddMembersModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Project",
    "Are you sure you want to delete this project?",
    "destructive"
  );

  const onDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate({ param: { projectId: id } });
  };

  const onCopyId = () => {
    navigator.clipboard.writeText(id);
    toast.success("Project ID copied to clipboard");
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
            Edit Project
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => {
              setInitialProjectId(id);
              openAddMembers();
            }}
            className="font-medium p-[10px]"
          >
            <UserPlusIcon className="size-4 mr-2 stroke-2" />
            Add Member
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onDelete}
            disabled={isPending}
            className="text-red-700 focus:text-red-700 font-medium p-[10px]"
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete Project
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
