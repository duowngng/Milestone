"use client";

import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { PlusIcon, CalendarIcon, SettingsIcon } from "lucide-react";

import { Task } from "@/features/tasks/types";
import { Project } from "@/features/projects/types";
import { WorkspaceMember } from "@/features/members/types";
import { useGetMembers } from "@/features/members/workspace/api/use-get-members";
import { useGetCurrentMember } from "@/features/members/workspace/api/use-get-current-member";
import { isWorkspaceManager } from "@/features/members/workspace/utils";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetManagedProjects } from "@/features/projects/hooks/use-get-managed-projects";
import { useGetTasks } from "@/features/tasks/api/use-get-tasks";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspaceAnalytics } from "@/features/workspaces/api/use-get-workspace-analytics";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";
import { Analytics } from "@/components/analytics";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { DottedSeparator } from "@/components/dotted-separator";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { MemberAvatar } from "@/features/members/components/member-avatar";

export const WorkspaceIdClient = () => {
  const workspaceId = useWorkspaceId();

  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetWorkspaceAnalytics({ workspaceId });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: managedProjects, isLoading: isLoadingManagedProjects } =
    useGetManagedProjects({
      workspaceId,
    });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const { data: currentMember, isLoading: isLoadingMember } =
    useGetCurrentMember({
      workspaceId,
      enabled: !!workspaceId,
    });
  const { data: tasks, isLoading: isLoadingTasks } = useGetTasks({
    workspaceId,
    assigneeId: currentMember?.$id,
  });

  const isManager = currentMember ? isWorkspaceManager(currentMember) : false;

  const isLoading =
    isLoadingAnalytics ||
    isLoadingTasks ||
    isLoadingProjects ||
    isLoadingMembers ||
    isLoadingMember ||
    isLoadingManagedProjects;

  if (isLoading) {
    return <PageLoader />;
  }

  if (
    !analytics ||
    !tasks ||
    !projects ||
    !members ||
    !currentMember ||
    !managedProjects
  ) {
    return <PageError message="Failed to load workspace data" />;
  }

  return (
    <div className="h-full flex flex-col space-y-4">
      <Analytics data={analytics} />
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        <TaskList
          data={tasks.documents}
          total={tasks.total}
          canCreateTask={managedProjects.length > 0}
        />
        <ProjectList
          data={projects.documents}
          total={projects.total}
          canCreateProject={isManager}
        />
        <MemberList data={members.documents} total={members.total} />
      </div>
    </div>
  );
};

interface TaskListProps {
  data: Task[];
  total: number;
  canCreateTask: boolean;
}

export const TaskList = ({ data, total, canCreateTask }: TaskListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createTask } = useCreateTaskModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-muted rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Tasks ({total})</p>
          {canCreateTask && (
            <Button onClick={() => createTask()} variant="muted" size="icon">
              <PlusIcon className="size-4 text-neutral-400" />
            </Button>
          )}
        </div>
        <DottedSeparator className="my-4" />
        <ul className="flex flex-col gap-y-4">
          {data.slice(0, 3).map((task) => (
            <li key={task.$id}>
              <Link href={`/workspaces/${workspaceId}/tasks/${task.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4">
                    <p className="text-lg font-medium truncate">{task.name}</p>
                    <div className="flex items-center gap-x-2">
                      <p>{task.project?.name}</p>
                      <div className="size-1 rounded-full bg-neutral-300" />
                      <div className="text-sm text-muted-foreground flex items-center">
                        <CalendarIcon className="size-3 mr-1" />
                        <span className="truncate">
                          {formatDistanceToNow(new Date(task.dueDate))}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="text-sm text-muted-foreground text-center hidden first-of-type:block">
            No task found
          </li>
        </ul>
        {total > 0 && (
          <Button variant="muted" className="mt-4 w-full" asChild>
            <Link href={`/workspaces/${workspaceId}/tasks`}>Show all</Link>
          </Button>
        )}
      </div>
    </div>
  );
};

interface ProjectListProps {
  data: Project[];
  total: number;
  canCreateProject: boolean;
}

export const ProjectList = ({
  data,
  total,
  canCreateProject,
}: ProjectListProps) => {
  const workspaceId = useWorkspaceId();
  const { open: createProject } = useCreateProjectModal();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Projects ({total})</p>
          {canCreateProject && (
            <Button
              onClick={() => createProject()}
              variant="secondary"
              size="icon"
            >
              <PlusIcon className="size-4 text-neutral-400" />
            </Button>
          )}
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {data.map((project) => (
            <li key={project.$id}>
              <Link href={`/workspaces/${workspaceId}/projects/${project.$id}`}>
                <Card className="shadow-none rounded-lg hover:opacity-75 transition">
                  <CardContent className="p-4 flex items-center gap-x-2.5">
                    <ProjectAvatar
                      name={project.name}
                      image={project.imageUrl}
                      className="size-12"
                      fallbackClassName="text-lg"
                    />
                    <p className="text-lg font-medium truncate">
                      {project.name}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            </li>
          ))}
          <li className="col-span-2 text-sm text-muted-foreground text-center hidden first-of-type:block">
            No project found
          </li>
        </ul>
      </div>
    </div>
  );
};

interface MemberListProps {
  data: WorkspaceMember[];
  total: number;
}

export const MemberList = ({ data, total }: MemberListProps) => {
  const workspaceId = useWorkspaceId();

  return (
    <div className="flex flex-col gap-y-4 col-span-1">
      <div className="bg-white border rounded-lg p-4">
        <div className="flex items-center justify-between">
          <p className="text-lg font-semibold">Members ({total})</p>
          <Button variant="secondary" size="icon" asChild>
            <Link href={`/workspaces/${workspaceId}/members`}>
              <SettingsIcon className="size-4 text-neutral-400" />
            </Link>
          </Button>
        </div>
        <DottedSeparator className="my-4" />
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.map((member) => (
            <li key={member.$id}>
              <Card className="shadow-none rounded-lg overflow-hidden">
                <CardContent className="p-3 flex flex-col items-center gap-x-2">
                  <MemberAvatar name={member.name} className="size-12" />
                  <div className="flex flex-col items-center overflow-hidden">
                    <p className="text-lg font-medium line-clamp-1">
                      {member.name}
                    </p>
                    <p className="text-sm text-muted-foreground line-clamp-1">
                      {member.email}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </li>
          ))}
          <li className=" text-sm text-muted-foreground text-center hidden first-of-type:block">
            No member found
          </li>
        </ul>
      </div>
    </div>
  );
};
