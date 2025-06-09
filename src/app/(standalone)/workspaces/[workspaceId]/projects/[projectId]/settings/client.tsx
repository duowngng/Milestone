"use client";

import { useRouter } from "next/navigation";

import { useGetProject } from "@/features/projects/api/use-get-project";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useProjectId } from "@/features/projects/hooks/use-project-id";
import { useGetCurrentProjectMember } from "@/features/members/project/api/use-get-current-project-member";
import { isProjectManager } from "@/features/members/project/utils";
import { EditProjectForm } from "@/features/projects/components/edit-project-form";

import { PageLoader } from "@/components/page-loader";
import { PageError } from "@/components/page-error";

export const ProjectIdSettingsClient = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const projectId = useProjectId();

  const { data: initialValues, isLoading } = useGetProject({ projectId });

  const { data: currentMember } = useGetCurrentProjectMember({
    workspaceId,
    projectId,
    enabled: !!projectId && !!workspaceId,
  });

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues || !currentMember) {
    return <PageError message="Project not found" />;
  }

  if (!isProjectManager(currentMember)) {
    router.push(`/workspaces/${workspaceId}/projects/${projectId}`);
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditProjectForm initialValues={initialValues} />
    </div>
  );
};
