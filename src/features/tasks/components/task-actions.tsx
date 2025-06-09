import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import { useConfirm } from "@/hooks/use-confirm";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

import { useDeleteTask } from "../api/use-delete-task";
import { useEditTaskModal } from "../hooks/use-edit-task-modal";
import { useCanManageTask } from "../hooks/use-can-manage-task";
import { Task } from "../types";

interface TaskActionsProps {
  id: string;
  projectId: string;
  task: Task;
  children: React.ReactNode;
}

export const TaskActions = ({
  id,
  projectId,
  task: providedTask,
  children,
}: TaskActionsProps) => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();

  const { open } = useEditTaskModal();

  const { canDeleteTask, canEditLimitedFields, isLoading } = useCanManageTask({
    task: providedTask,
  });

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "Are you sure you want to delete this task?",
    "destructive"
  );
  const { mutate, isPending } = useDeleteTask();

  const onDelete = async () => {
    const ok = await confirm();

    if (!ok) {
      return;
    }

    mutate({ param: { taskId: id } });
  };

  const onOpenTask = () => {
    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  const onOpenProject = () => {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  };

  return (
    <div className="flex justify-end">
      <ConfirmDialog />
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem
            onClick={onOpenTask}
            className="font-medium p-[10px]"
          >
            <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
            Task Details
          </DropdownMenuItem>
          {!paramProjectId && (
            <DropdownMenuItem
              onClick={onOpenProject}
              className="font-medium p-[10px]"
            >
              <ExternalLinkIcon className="size-4 mr-2 stroke-2" />
              Open Project
            </DropdownMenuItem>
          )}
          <DropdownMenuItem
            disabled={isLoading}
            onClick={() => {
              if (!canEditLimitedFields || isLoading) {
                return;
              }
              open(id);
            }}
            className={cn(
              "font-medium p-[10px]",
              (!canEditLimitedFields || isLoading) &&
                "opacity-50 cursor-not-allowed"
            )}
          >
            <PencilIcon className="size-4 mr-2 stroke-2" />
            Edit Task
          </DropdownMenuItem>
          <DropdownMenuItem
            disabled={isPending || isLoading}
            onClick={(e) => {
              if (isPending || isLoading || !canDeleteTask) {
                e.preventDefault();
                return;
              }
              onDelete();
            }}
            className={cn(
              "font-medium p-[10px]",
              "text-red-700 focus:text-red-700",
              (!canDeleteTask || isLoading) && "opacity-50 cursor-not-allowed"
            )}
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete Task
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};
