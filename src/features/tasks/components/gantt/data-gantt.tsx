"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import groupBy from "lodash.groupby";

import {
  GanttProvider,
  GanttSidebar,
  GanttSidebarGroup,
  GanttSidebarItem,
  GanttTimeline,
  GanttHeader,
  GanttFeatureList,
  GanttFeatureListGroup,
  GanttFeatureItem,
  GanttToday,
  GanttCreateMarkerTrigger,
} from "@/components/ui/kibo-ui/gantt";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useConfirm } from "@/hooks/use-confirm";

import { useCreateTaskModal } from "../../hooks/use-create-task-modal";
import { useEditTaskModal } from "../../hooks/use-edit-task-modal";
import { useDeleteTask } from "../../api/use-delete-task";
import { useUpdateTask } from "../../api/use-update-task";
import { Task, TaskStatus } from "../../types";

interface DataGanttProps {
  data: Task[];
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "#ec4899",
  [TaskStatus.TODO]: "#f87171",
  [TaskStatus.IN_PROGRESS]: "#facc15",
  [TaskStatus.IN_REVIEW]: "#60a5fa",
  [TaskStatus.DONE]: "#34d399",
};

export function DataGantt({ data }: DataGanttProps) {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();
  const editTask = useEditTaskModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "Are you sure you want to delete this task?",
    "destructive"
  );

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();

  const { data: projectsData } = useGetProjects({
    workspaceId,
    enabled: !!workspaceId,
  });

  const projectMap = useMemo(
    () =>
      projectsData?.documents.reduce<Record<string, string>>((acc, proj) => {
        acc[proj.$id] = proj.name;
        return acc;
      }, {}) ?? {},
    [projectsData]
  );

  const features = useMemo(
    () =>
      data
        .map((t) => ({
          id: t.$id,
          name: t.name,
          startAt: parseISO(t.startDate),
          endAt: parseISO(t.dueDate),
          progress: t.progress,
          status: {
            id: t.$id,
            name: t.status,
            color: statusColorMap[t.status as TaskStatus],
          },
          assignee: t.assignee,
          group: t.projectId,
        }))
        .sort((a, b) => a.startAt.getTime() - b.startAt.getTime()),
    [data]
  );

  const grouped = useMemo(() => groupBy(features, "group"), [features]);
  const sortedGroups = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(grouped).sort(([a], [b]) => {
          const nameA = projectMap[a] || a;
          const nameB = projectMap[b] || b;
          return nameA.localeCompare(nameB);
        })
      ),
    [grouped, projectMap]
  );

  const handleView = (id: string) => {
    const feature = features.find((f) => f.id === id);
    if (!feature) return;

    const ganttContainer = document.querySelector(".gantt");
    if (!ganttContainer) return;

    const zoom = 100;
    const columnWidth = 50;
    const timelineStartDate = new Date(new Date().getFullYear() - 1, 0, 1);

    const diffDays = differenceInDays(feature.startAt, timelineStartDate);
    const position = diffDays * ((columnWidth * zoom) / 100);

    const padding = ganttContainer.clientWidth / 4 - 150;
    const scrollPosition = Math.max(0, position - padding);

    ganttContainer.scrollTo({
      left: scrollPosition,
      behavior: "smooth",
    });
  };

  const handleDelete = async (id: string) => {
    const ok = await confirm();
    if (!ok) return;

    deleteTask({ param: { taskId: id } });
  };

  const handleMove = (id: string, startAt: Date, endAt: Date | null) => {
    const task = data.find((t) => t.$id === id);
    if (!task) return;

    const updateData = {
      startDate: startAt,
      dueDate: endAt ? endAt : parseISO(task.dueDate),
    };

    updateTask({
      param: { taskId: id },
      json: updateData,
    });
  };

  const handleAddMarker = (date: Date) => console.log("Create marker", date);

  console.log("Gantt features", features);
  return (
    <>
      <ConfirmDialog />
      <GanttProvider
        range="daily"
        zoom={100}
        onAddItem={(date: Date) =>
          open({ projectId: paramProjectId, startDate: date })
        }
        className="border rounded-lg flex-grow h-full"
      >
        <GanttSidebar className="invisible lg:visible">
          {Object.entries(sortedGroups).map(([projectId, feats]) => (
            <GanttSidebarGroup
              key={projectId}
              name={projectMap[projectId] || projectId}
            >
              {feats.map((f) => (
                <GanttSidebarItem
                  key={f.id}
                  feature={f}
                  onSelectItem={handleView}
                />
              ))}
            </GanttSidebarGroup>
          ))}
        </GanttSidebar>

        <GanttTimeline>
          <GanttHeader />

          <GanttFeatureList>
            {Object.entries(sortedGroups).map(([projectId, feats]) => (
              <GanttFeatureListGroup key={projectId}>
                {feats.map((f) => (
                  <div className="flex" key={f.id}>
                    <ContextMenu>
                      <ContextMenuTrigger asChild>
                        <button type="button">
                          <GanttFeatureItem
                            onMove={handleMove}
                            {...f}
                            progress={f.progress}
                            statusColor="rgb(165 180 252)"
                          >
                            <p className="flex flex-1 text-xs items-center justify-between min-w-0">
                              <span className="flex items-center gap-1 min-w-0">
                                <MemberAvatar
                                  name={f.assignee.name}
                                  fallbackClassName="text-[10px]"
                                />
                                <span className="truncate text-ellipsis whitespace-nowrap overflow-hidden">
                                  {f.name}
                                </span>
                              </span>
                              <span className="ml-1 text-xs opacity-70 shrink-0">
                                {f.progress}%
                              </span>
                            </p>
                          </GanttFeatureItem>
                        </button>
                      </ContextMenuTrigger>
                      <ContextMenuContent className="w-48">
                        <ContextMenuItem
                          onClick={() =>
                            router.push(
                              `/workspaces/${workspaceId}/tasks/${f.id}`
                            )
                          }
                          className="font-medium p-[10px]"
                        >
                          <ExternalLinkIcon
                            size={16}
                            className="size-4 mr-2 stroke-2"
                          />
                          Task Details
                        </ContextMenuItem>
                        {!paramProjectId && (
                          <ContextMenuItem
                            onClick={() =>
                              router.push(
                                `/workspaces/${workspaceId}/projects/${f.group}`
                              )
                            }
                            className="font-medium p-[10px]"
                          >
                            <ExternalLinkIcon
                              size={16}
                              className="size-4 mr-2 stroke-2"
                            />
                            Open Project
                          </ContextMenuItem>
                        )}
                        <ContextMenuItem
                          onClick={() => editTask.open(f.id)}
                          className="font-medium p-[10px]"
                        >
                          <PencilIcon
                            size={16}
                            className="size-4 mr-2 stroke-2"
                          />
                          Edit Task
                        </ContextMenuItem>
                        <ContextMenuItem
                          className="text-red-700 focus:text-red-700 font-medium p-[10px]"
                          onClick={() => handleDelete(f.id)}
                        >
                          <TrashIcon className="size-4 mr-2 stroke-2" />
                          Delete Task
                        </ContextMenuItem>
                      </ContextMenuContent>
                    </ContextMenu>
                  </div>
                ))}
              </GanttFeatureListGroup>
            ))}
          </GanttFeatureList>

          <GanttToday />
          <GanttCreateMarkerTrigger onCreateMarker={handleAddMarker} />
        </GanttTimeline>
      </GanttProvider>
    </>
  );
}
