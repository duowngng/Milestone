"use client";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetWorkspace } from "@/features/workspaces/api/use-get-workspace";
import { EditWorkspaceForm } from "@/features/workspaces/components/edit-workspace-form";
import { useGetCurrentMember } from "@/features/members/workspace/api/use-get-current-member";
import { isWorkspaceManager } from "@/features/members/workspace/utils";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

export const WorkspaceIdSettingsClient = () => {
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading: isLoadingWorkspace } =
    useGetWorkspace({ workspaceId });
  const { data: currentMember, isLoading: isLoadingMember } =
    useGetCurrentMember({
      workspaceId,
      enabled: !!workspaceId,
    });

  const isManager = currentMember ? isWorkspaceManager(currentMember) : false;

  const isLoading = isLoadingWorkspace || isLoadingMember;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found" />;
  }

  return (
    <div className="w-full lg:max-w-xl">
      <EditWorkspaceForm initialValues={initialValues} isManager={isManager} />
    </div>
  );
};
