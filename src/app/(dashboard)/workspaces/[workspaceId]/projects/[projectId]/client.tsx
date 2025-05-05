"use client";

import Link from "next/link";
import { SettingsIcon, UsersIcon } from "lucide-react";

import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useGetProjectAnalytics } from "@/features/projects/api/use-get-project-analytics";
import { ProjectAvatar } from "@/features/projects/components/project-avatar";
import { TaskViewSwitcher } from "@/features/tasks/components/task-view-switcher";

import { Button } from "@/components/ui/button";
import { Analytics } from "@/components/analytics";
import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

export const ProjectIdClient = () => {
  const projectId = useProjectId();
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });
  const { data: analytics, isLoading: isLoadingAnalytics } =
    useGetProjectAnalytics({ projectId });

  const isLoading = isLoadingProject || isLoadingAnalytics;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!project) {
    return <PageError message="Project not found" />;
  }

  return (
    <div className="flex flex-col gap-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-x-2">
          <ProjectAvatar
            image={project.imageUrl}
            name={project.name}
            className="size-8"
          />
          <p className="text-lg font-semibold">{project.name}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.$id}/settings`}
            >
              <SettingsIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:block">Project Settings</span>
            </Link>
          </Button>
          <Button variant="secondary" size="sm" asChild>
            <Link
              href={`/workspaces/${project.workspaceId}/projects/${project.$id}/members`}
            >
              <UsersIcon className="size-4 lg:mr-2" />
              <span className="hidden lg:block">Project Members</span>
            </Link>
          </Button>
        </div>
      </div>
      {analytics ? <Analytics data={analytics} /> : null}
      <TaskViewSwitcher hideProjectFilter />
    </div>
  );
};
