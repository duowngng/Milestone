import { useMemo } from "react";
import { Loader } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { PageError } from "@/components/page-error";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/workspace/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useGetProjectMembers } from "@/features/members/project/api/use-get-project-members";
import { usePrefetchProjectMembers } from "@/features/members/project/hooks/use-prefetch-project-members";
import { useGetManagedProjects } from "@/features/projects/hooks/use-get-managed-projects";

import { CreateTaskForm } from "./create-task-form";
import { TaskStatus } from "../types";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
  initialStatus?: TaskStatus;
  initialProjectId?: string;
  initialStartDate?: Date;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  initialStatus,
  initialProjectId,
  initialStartDate,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const { data: managedProjects, isLoading: isLoadingManagedProjects } =
    useGetManagedProjects({
      workspaceId,
    });

  usePrefetchProjectMembers({
    workspaceId,
    projects: projects?.documents,
    shouldPrefetch: true,
  });
  const { data: projectMembers, isLoading: isLoadingProjectMembers } =
    useGetProjectMembers({
      workspaceId,
      projectId: initialProjectId || "",
    });

  const projectOptions = useMemo(() => {
    if (!managedProjects) return [];

    return managedProjects.map((project) => ({
      id: project.id,
      name: project.name,
      imageUrl: project.imageUrl,
    }));
  }, [managedProjects]);

  const memberOptions = useMemo(() => {
    if (!members?.documents || !projectMembers?.documents || !initialProjectId)
      return [];

    const projectMemberIds = new Set(
      projectMembers.documents.map((pm) => pm.userId)
    );

    return members.documents
      .filter((member) => projectMemberIds.has(member.userId))
      .map((member) => ({
        id: member.$id,
        name: member.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members?.documents, projectMembers?.documents, initialProjectId]);

  const canCreateTask = managedProjects.length > 0;

  const isLoading =
    isLoadingProjects ||
    isLoadingMembers ||
    isLoadingProjectMembers ||
    isLoadingManagedProjects;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      {canCreateTask ? (
        <CreateTaskForm
          onCancel={onCancel}
          projectOptions={projectOptions ?? []}
          memberOptions={memberOptions ?? []}
          initialStatus={initialStatus}
          initialProjectId={initialProjectId}
          initialStartDate={initialStartDate}
        />
      ) : (
        <Card className="w-full h-[714px] border-none shadow-none">
          <CardContent className="flex items-center justify-center h-full">
            <PageError message="You do not have permission to create tasks" />
          </CardContent>
        </Card>
      )}
    </div>
  );
};
