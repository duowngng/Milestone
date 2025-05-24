import React from "react";
import { FlagIcon, PencilIcon, TrashIcon } from "lucide-react";
import { cn } from "@/lib/utils";

import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

interface MilestoneCardProps {
  id: string;
  title: string;
  project: {
    name: string;
    imageUrl?: string;
  };
  projectId: string;
  onEdit?: (id: string) => void;
  onRemove?: (id: string) => void;
}

export const MilestoneCard = ({
  id,
  title,
  project,
  onEdit,
  onRemove,
}: MilestoneCardProps) => {
  const paramProjectId = useProjectId();

  const handleEdit = () => onEdit?.(id);
  const handleRemove = () => onRemove?.(id);

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <div className="px-2">
          <div
            className={cn(
              "p-1.5 text-xs border rounded-md border-b-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
              "border-b-indigo-500 bg-indigo-50 text-indigo-900"
            )}
          >
            <div className="flex items-center gap-x-1">
              <FlagIcon className="size-3.5" />
              <p className="font-semibold">{title}</p>
            </div>
            {!paramProjectId && (
              <div className="flex items-center gap-x-1">
                <ProjectAvatar name={project?.name} image={project?.imageUrl} />
                <span>{project?.name}</span>
              </div>
            )}
          </div>
        </div>
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        {onEdit && (
          <ContextMenuItem
            onClick={handleEdit}
            className="font-medium p-[10px]"
          >
            <PencilIcon size={16} className="size-4 mr-2 stroke-2" />
            Edit milestone
          </ContextMenuItem>
        )}
        {onRemove && (
          <ContextMenuItem
            onClick={handleRemove}
            className="font-medium p-[10px] text-red-700 focus:text-red-700"
          >
            <TrashIcon className="size-4 mr-2 stroke-2" />
            Delete Milestone
          </ContextMenuItem>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
};
