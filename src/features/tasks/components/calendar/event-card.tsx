import React from "react";
import { useRouter } from "next/navigation";

import { AnimatedCircularProgressBar } from "@/components/magicui/animated-circular-progress-bar";

import { Project } from "@/features/projects/types";
import { WorkspaceMember } from "@/features/members/types";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";

import { cn } from "@/lib/utils";

import { TaskStatus } from "../../types";

interface EventCardProps {
  title: string;
  assignee: WorkspaceMember;
  project: Project;
  status: TaskStatus;
  id: string;
  progress: number;
  displayMode?: "compact" | "detailed";
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "border-l-pink-500 bg-pink-50",
  [TaskStatus.TODO]: "border-l-red-500 bg-red-50",
  [TaskStatus.IN_PROGRESS]: "border-l-yellow-500 bg-yellow-50",
  [TaskStatus.IN_REVIEW]: "border-l-blue-500 bg-blue-50",
  [TaskStatus.DONE]: "border-l-emerald-500 bg-emerald-50",
};

export const EventCard = ({
  title,
  assignee,
  project,
  status,
  id,
  progress,
  displayMode,
}: EventCardProps) => {
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const router = useRouter();
  const getProgressColor = (value: number): string => {
    if (value < 30) return "#f44336";
    if (value < 70) return "#ffeb3b";
    if (value === 100) return "#4caf50";
    return "#2196f3";
  };

  const onClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();

    router.push(`/workspaces/${workspaceId}/tasks/${id}`);
  };

  return (
    <div className="px-2">
      <div
        onClick={onClick}
        className={cn(
          "p-1.5 text-xs text-primary border rounded-md border-l-4 flex flex-col gap-y-1.5 cursor-pointer hover:opacity-75 transition",
          statusColorMap[status]
        )}
      >
        <p className="font-medium">{title}</p>

        {displayMode == "detailed" ? (
          <div className="flex items-center gap-x-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <div className="flex items-center gap-x-1">
              <MemberAvatar name={assignee?.name} />
              <span>{assignee?.name}</span>
            </div>
            {!paramProjectId && (
              <>
                <div className="size-1 rounded-full bg-neutral-300" />
                <div className="flex items-center gap-x-1">
                  <ProjectAvatar
                    name={project?.name}
                    image={project?.imageUrl}
                  />
                  <span>{project?.name}</span>
                </div>
              </>
            )}
            <div className="size-1 rounded-full bg-neutral-300" />
            <AnimatedCircularProgressBar
              value={progress}
              max={100}
              min={0}
              gaugePrimaryColor={getProgressColor(progress)}
              gaugeSecondaryColor="#e0e0e0"
              className={cn(
                "size-5 font-medium",
                progress === 100 ? "text-[8px]" : "text-[9px]"
              )}
            />
          </div>
        ) : (
          <div className="flex items-center gap-x-1">
            <MemberAvatar name={assignee?.name} />
            {!paramProjectId && (
              <>
                <div className="size-1 rounded-full bg-neutral-300" />
                <ProjectAvatar name={project?.name} image={project?.imageUrl} />
              </>
            )}
            <div className="size-1 rounded-full bg-neutral-300" />
            <AnimatedCircularProgressBar
              value={progress}
              max={100}
              min={0}
              gaugePrimaryColor={getProgressColor(progress)}
              gaugeSecondaryColor="#e0e0e0"
              className={cn(
                "size-5 font-medium",
                progress === 100 ? "text-[8px]" : "text-[9px]"
              )}
            />
          </div>
        )}
      </div>
    </div>
  );
};
