"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { ExternalLinkIcon, PencilIcon, TrashIcon } from "lucide-react";
import { differenceInDays, parseISO } from "date-fns";
import groupBy from "lodash.groupby";
import { cn } from "@/lib/utils";

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
  GanttMarker,
  GanttCreateMarkerTrigger,
} from "@/components/ui/kibo-ui/gantt";
import {
  ContextMenu,
  ContextMenuTrigger,
  ContextMenuContent,
  ContextMenuItem,
} from "@/components/ui/context-menu";

import { useConfirm } from "@/hooks/use-confirm";
import { MemberAvatar } from "@/features/members/components/member-avatar";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { Milestone } from "@/features/milestones/types";
import { useCreateMilestoneModal } from "@/features/milestones/hooks/use-create-milestone-modal";
import { useEditMilestoneModal } from "@/features/milestones/hooks/use-edit-milestone-modal";
import { useDeleteMilestone } from "@/features/milestones/api/use-delete-milestone";

import { useCreateTaskModal } from "../../hooks/use-create-task-modal";
import { useEditTaskModal } from "../../hooks/use-edit-task-modal";
import { useDeleteTask } from "../../api/use-delete-task";
import { useUpdateTask } from "../../api/use-update-task";
import { Task, TaskStatus } from "../../types";

interface DataGanttProps {
  data: Task[];
  milestones?: Milestone[];
  isManager?: boolean;
}

const statusColorMap: Record<TaskStatus, string> = {
  [TaskStatus.BACKLOG]: "#ec4899",
  [TaskStatus.TODO]: "#f87171",
  [TaskStatus.IN_PROGRESS]: "#facc15",
  [TaskStatus.IN_REVIEW]: "#60a5fa",
  [TaskStatus.DONE]: "#34d399",
};

const projectColorSchemes: Array<{
  marker: string;
  feature: string;
}> = [
  {
    marker: "bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
    feature: "bg-indigo-300",
  },
  {
    marker: "bg-green-100 text-green-900 hover:bg-green-200",
    feature: "bg-green-300",
  },
  {
    marker: "bg-purple-100 text-purple-900 hover:bg-purple-200",
    feature: "bg-purple-300",
  },
  { marker: "bg-red-100 text-red-900 hover:bg-red-200", feature: "bg-red-300" },
  {
    marker: "bg-blue-100 text-blue-900 hover:bg-blue-200",
    feature: "bg-blue-300",
  },
  {
    marker: "bg-orange-100 text-orange-900 hover:bg-orange-200",
    feature: "bg-orange-300",
  },
  {
    marker: "bg-teal-100 text-teal-900 hover:bg-teal-200",
    feature: "bg-teal-300",
  },
  {
    marker: "bg-amber-100 text-amber-900 hover:bg-amber-200",
    feature: "bg-amber-300",
  },
  {
    marker: "bg-cyan-100 text-cyan-900 hover:bg-cyan-200",
    feature: "bg-cyan-300",
  },
  {
    marker: "bg-rose-100 text-rose-900 hover:bg-rose-200",
    feature: "bg-rose-300",
  },
];

const makeWorkspaceColorPicker = () => {
  const map = new Map<string, { marker: string; feature: string }>();
  let idx = 0;
  return (projectId: string) => {
    if (!map.has(projectId)) {
      map.set(
        projectId,
        projectColorSchemes[idx++ % projectColorSchemes.length]
      );
    }
    return map.get(projectId)!;
  };
};

const projectViewColorPicker = (): ((projectId: string) => {
  marker: string;
  feature: string;
}) => {
  return (_projectId: string) => ({
    marker: "bg-indigo-100 text-indigo-900 hover:bg-indigo-200",
    feature: "bg-indigo-300",
  });
};

const makeTaskMapper = (
  pickColor: (projectId: string) => { marker: string; feature: string }
) => {
  return (t: Task) => {
    const colorScheme = pickColor(t.projectId);
    return {
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
      projectColorScheme: colorScheme,
    };
  };
};

const makeMilestoneMapper = (
  pickColor: (projectId: string) => { marker: string; feature: string }
) => {
  return (m: Milestone) => {
    const colorScheme = pickColor(m.projectId);
    return {
      id: m.$id,
      date: parseISO(m.date),
      label: m.name,
      projectId: m.projectId,
      projectName: m.project.name,
      colorScheme: colorScheme.marker,
    };
  };
};

export function DataGantt({
  data,
  milestones = [],
  isManager,
}: DataGanttProps) {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();
  const editTask = useEditTaskModal();
  const editMilestone = useEditMilestoneModal();
  const { open: openCreateMilestone } = useCreateMilestoneModal();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete task",
    "Are you sure you want to delete this task?",
    "destructive"
  );

  const [MilestoneConfirmDialog, confirmMilestone] = useConfirm(
    "Delete milestone",
    "Are you sure you want to delete this milestone?",
    "destructive"
  );

  const { mutate: deleteTask } = useDeleteTask();
  const { mutate: updateTask } = useUpdateTask();
  const { mutate: deleteMilestone } = useDeleteMilestone();

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

  const pickProjectColor = useMemo(
    () =>
      paramProjectId ? projectViewColorPicker() : makeWorkspaceColorPicker(),
    [paramProjectId]
  );

  const features = useMemo(() => {
    const mapTask = makeTaskMapper(pickProjectColor);
    return data
      .map(mapTask)
      .sort((a, b) => a.startAt.getTime() - b.startAt.getTime());
  }, [data, pickProjectColor]);

  const milestoneMarkers = useMemo(() => {
    const mapMilestone = makeMilestoneMapper(pickProjectColor);
    return milestones.map(mapMilestone);
  }, [milestones, pickProjectColor]);

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

  const handleDeleteMilestone = async (id: string) => {
    const ok = await confirmMilestone();
    if (!ok) return;

    deleteMilestone({ param: { milestoneId: id } });
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

  const handleAddMarker = (date: Date) => {
    if (isManager && paramProjectId) {
      openCreateMilestone({ date });
    }
  };

  const handleEditMilestone = (id: string) => {
    if (isManager) {
      editMilestone.open(id);
    }
  };

  return (
    <>
      <ConfirmDialog />
      <MilestoneConfirmDialog />
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
                            bgColor={
                              f.projectColorScheme.feature || "bg-indigo-300"
                            }
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
                          onClick={(e) => {
                            if (!isManager) {
                              e.preventDefault();
                              return;
                            }
                            handleDelete(f.id);
                          }}
                          className={cn(
                            "font-medium p-[10px]",
                            "text-red-700 focus:text-red-700",
                            !isManager && "opacity-50 cursor-not-allowed"
                          )}
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

          <GanttToday className="hover:font-semibold" />

          {milestoneMarkers.map((marker) => (
            <GanttMarker
              key={marker.id}
              id={marker.id}
              date={marker.date}
              label={
                !paramProjectId
                  ? `${marker.label} (${marker.projectName})`
                  : marker.label
              }
              onEdit={isManager ? handleEditMilestone : undefined}
              onRemove={isManager ? handleDeleteMilestone : undefined}
              className={cn(marker.colorScheme, "hover:font-semibold")}
            />
          ))}

          {isManager && (
            <GanttCreateMarkerTrigger onCreateMarker={handleAddMarker} />
          )}
        </GanttTimeline>
      </GanttProvider>
    </>
  );
}
