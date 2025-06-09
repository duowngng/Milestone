"use client";

import { useCallback } from "react";
import { useQueryState } from "nuqs";
import { Loader, PlusIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { DottedSeparator } from "@/components/dotted-separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetManagedProjects } from "@/features/projects/hooks/use-get-managed-projects";
import { useGetCurrentMember } from "@/features/members/workspace/api/use-get-current-member";
import { isWorkspaceManager } from "@/features/members/workspace/utils";
import { useGetCurrentProjectMember } from "@/features/members/project/api/use-get-current-project-member";
import { isProjectManager } from "@/features/members/project/utils";
import { useGetMilestones } from "@/features/milestones/api/use-get-milestones";

import { DataFilter } from "./data-filter";
import { columns } from "./table/columns";
import { DataTable } from "./table/data-table";
import { DataKanban } from "./kanban/data-kanban";
import { DataCalendar } from "./calendar/data.calendar";
import { DataGantt } from "./gantt/data-gantt";

import { useCreateTaskModal } from "../hooks/use-create-task-modal";
import { useGetTasks } from "../api/use-get-tasks";
import { useBulkUpdateTask } from "../api/use-bulk-update-task";
import { useTaskFilters } from "../hooks/use-task-filters";
import { TaskStatus } from "../types";

interface TaskViewSwitcherProps {
  hideProject?: boolean;
  memberId?: string;
}

export const TaskViewSwitcher = ({
  hideProject,
  memberId,
}: TaskViewSwitcherProps) => {
  const [
    {
      projectId,
      status,
      priority,
      assigneeId,
      search,
      startDate,
      dueDate,
      progress,
    },
  ] = useTaskFilters();
  const [view, setView] = useQueryState("task-view", {
    defaultValue: "table",
  });

  const workspaceId = useWorkspaceId();
  const paramProjectId = useProjectId();
  const { open } = useCreateTaskModal();

  const { data: managedProjects, isLoading: isLoadingManagedProjects } =
    useGetManagedProjects({
      workspaceId,
    });

  const { data: workspaceMember } = useGetCurrentMember({
    workspaceId,
    enabled: !!workspaceId,
  });

  const { data: projectMember } = useGetCurrentProjectMember({
    projectId: paramProjectId,
    workspaceId,
    enabled: !!paramProjectId && !!workspaceId,
  });

  const isUserWorkspaceManager = workspaceMember
    ? isWorkspaceManager(workspaceMember)
    : false;
  const isUserProjectManager = projectMember
    ? isProjectManager(projectMember)
    : false;

  const { mutate: bulkUpdate } = useBulkUpdateTask();

  const { data: milestones, isLoading: isLoadingMilestones } = useGetMilestones(
    {
      workspaceId,
      projectId: projectId || paramProjectId,
      enabled: !!workspaceId,
    }
  );

  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    projectId: projectId || paramProjectId,
    status,
    priority,
    assigneeId,
    search,
    startDate,
    dueDate,
    progress,
  });

  const onKanbanChange = useCallback(
    (tasks: { $id: string; status: TaskStatus; position: number }[]) => {
      bulkUpdate({
        json: { tasks },
      });
    },
    [bulkUpdate]
  );

  const isLoading =
    isLoadingTasks || isLoadingMilestones || isLoadingManagedProjects;

  const canCreateTasks = paramProjectId
    ? isUserProjectManager
    : managedProjects.length > 0;

  return (
    <Tabs
      defaultValue={view}
      onValueChange={setView}
      className="flex-1 w-full border rounded-lg flex flex-col overflow-hidden"
    >
      <div className="p-4 pb-0 shrink-0">
        {" "}
        <div className="flex flex-col gap-y-2 lg:flex-row justify-between items-center">
          <TabsList className="w-full lg:w-auto">
            <TabsTrigger className="h-8 w-full lg:w-auto" value="table">
              Table
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="kanban">
              Kanban
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="calendar">
              Calendar
            </TabsTrigger>
            <TabsTrigger className="h-8 w-full lg:w-auto" value="gantt">
              Timeline
            </TabsTrigger>
          </TabsList>
          {canCreateTasks && (
            <Button
              onClick={() => open({ projectId: paramProjectId })}
              size="sm"
              className="w-full lg:w-auto"
            >
              <PlusIcon className="size-4 mr-2" />
              New
            </Button>
          )}
        </div>
        <DottedSeparator className="my-4" />
        <DataFilter
          hideProject={hideProject}
          memberId={memberId}
          isManager={isUserProjectManager || isUserWorkspaceManager}
        />
        <DottedSeparator className="my-4" />
      </div>

      <div className="flex-grow overflow-hidden p-4 pt-0">
        {isLoading ? (
          <div className="w-full border rounded-lg h-dvh flex flex-col items-center justify-center">
            <Loader className="size-5 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <TabsContent value="table" className="mt-0">
              <DataTable
                columns={columns(hideProject)}
                data={tasks?.documents ?? []}
              />
            </TabsContent>
            <TabsContent value="kanban" className="mt-0">
              <DataKanban
                data={tasks?.documents ?? []}
                onChange={onKanbanChange}
                hideProject={hideProject}
                canCreateTasks={canCreateTasks}
              />
            </TabsContent>
            <TabsContent value="calendar" className="mt-0 h-full pb-4">
              <DataCalendar
                data={tasks?.documents ?? []}
                milestones={milestones?.documents ?? []}
                canManageMilestones={isUserProjectManager}
              />
            </TabsContent>
            <TabsContent value="gantt" className="mt-0 h-full pb-4">
              <DataGantt
                data={tasks?.documents ?? []}
                milestones={milestones?.documents ?? []}
                canCreateTasks={canCreateTasks}
                canManageMilestones={isUserProjectManager}
              />
            </TabsContent>
          </>
        )}
      </div>
    </Tabs>
  );
};
