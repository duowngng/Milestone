import { useMemo } from "react";

import { useGetCurrentProjectMember } from "@/features/members/project/api/use-get-current-project-member";
import { isProjectManager } from "@/features/members/project/utils";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { ProjectMember } from "@/features/members/types";
import { useCurrent } from "@/features/auth/api/use-current";

import { Task } from "../types";

interface UseCanManageTaskProps {
  task?: Task;
  projectMember?: ProjectMember;
}

export const useCanManageTask = ({
  task,
  projectMember: initialProjectMember,
}: UseCanManageTaskProps) => {
  const workspaceId = useWorkspaceId();
  const { data: user, isLoading: isLoadingUser } = useCurrent();

  const { data: fetchedProjectMember, isLoading: isLoadingProjectMember } =
    useGetCurrentProjectMember({
      workspaceId,
      projectId: task?.projectId || "",
      enabled: !!workspaceId && !!task?.projectId && !initialProjectMember,
    });

  const projectMember = initialProjectMember || fetchedProjectMember;

  const permissions = useMemo(() => {
    if (!task || !user) {
      return {
        canViewTask: false,
        canEditAllFields: false,
        canEditLimitedFields: false,
        canManageTask: false,
        canDeleteTask: false,
      };
    }

    const isUserProjectManager = projectMember
      ? isProjectManager(projectMember)
      : false;
    const isProjectMember = !!projectMember;
    const isAssignee = task.assignee?.userId === user.$id;

    if (isUserProjectManager) {
      return {
        canViewTask: true,
        canEditAllFields: true,
        canEditLimitedFields: true,
        canManageTask: true,
        canDeleteTask: true,
      };
    }

    if (isAssignee) {
      return {
        canViewTask: true,
        canEditAllFields: false,
        canEditLimitedFields: true,
        canManageTask: false,
        canDeleteTask: false,
      };
    }

    if (isProjectMember) {
      return {
        canViewTask: true,
        canEditAllFields: false,
        canEditLimitedFields: false,
        canManageTask: false,
        canDeleteTask: false,
      };
    }

    return {
      canViewTask: false,
      canEditAllFields: false,
      canEditLimitedFields: false,
      canManageTask: false,
      canDeleteTask: false,
    };
  }, [task, projectMember, user]);

  const isLoading = isLoadingProjectMember || isLoadingUser;

  return {
    ...permissions,
    isLoading,
    task,
    projectMember,
  };
};
