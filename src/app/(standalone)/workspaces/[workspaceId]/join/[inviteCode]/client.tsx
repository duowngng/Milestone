"use client";

import { useRouter } from "next/navigation";

import { PageError } from "@/components/page-error";
import { PageLoader } from "@/components/page-loader";

import { useGetWorkspaceInfo } from "@/features/workspaces/api/use-get-workspace-info";
import { JoinWorkspaceForm } from "@/features/workspaces/components/join-workspace-form";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetCurrentMember } from "@/features/members/workspace/api/use-get-current-member";

export const WorkspaceIdJoinClient = () => {
  const router = useRouter();
  const workspaceId = useWorkspaceId();
  const { data: initialValues, isLoading: isLoadingWorkspaceInfo } =
    useGetWorkspaceInfo({
      workspaceId,
    });
  const { data: currentMember, isLoading: isLoadingMember } =
    useGetCurrentMember({
      workspaceId,
      enabled: !!workspaceId,
    });

  const isLoading = isLoadingWorkspaceInfo || isLoadingMember;

  if (isLoading) {
    return <PageLoader />;
  }

  if (!initialValues) {
    return <PageError message="Workspace not found" />;
  }

  if (currentMember && workspaceId) {
    router.push(`/workspaces/${workspaceId}`);
  }

  return (
    <div className="w-full lg:max-w-xl">
      <JoinWorkspaceForm initialValues={initialValues} />
    </div>
  );
};
