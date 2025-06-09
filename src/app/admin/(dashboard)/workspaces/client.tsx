"use client";

import { Loader, PlusIcon } from "lucide-react";

import { DataTable } from "@/features/workspaces/components/admin/data-table";
import { DataFilter } from "@/features/workspaces/components/admin/data-filter";
import { columns } from "@/features/workspaces/components/admin/columns";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { Button } from "@/components/ui/button";

import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { useWorkspaceFilters } from "@/features/workspaces/hooks/admin/use-workspace-filters";
import { useCreateWorkspaceModal } from "@/features/workspaces/hooks/use-create-workspace-modal";
import { useGetMembers } from "@/features/members/workspace/api/admin/use-get-admin-members";
import { AdminWorkspaceMember } from "@/features/members/types";
import { AdminWorkspace } from "@/features/workspaces/types";

export const AdminWorkspacesClient = () => {
  const [{ name, userId, createdAt, updatedAt }] = useWorkspaceFilters();
  const { data: workspaces, isLoading: isLoadingWorkspaces } = useGetWorkspaces(
    {
      name,
      userId,
      createdAt,
      updatedAt,
    }
  );

  const { data: members, isLoading: isLoadingMembers } = useGetMembers();

  const isLoading = isLoadingWorkspaces || isLoadingMembers;

  const { open } = useCreateWorkspaceModal();

  const membersByWorkspace: Record<string, AdminWorkspaceMember[]> = {};
  members?.documents.forEach((member: AdminWorkspaceMember) => {
    if (!membersByWorkspace[member.workspaceId]) {
      membersByWorkspace[member.workspaceId] = [];
    }
    membersByWorkspace[member.workspaceId].push(member);
  });

  const workspacesWithMembers = workspaces?.documents.map(
    (workspace: AdminWorkspace) => ({
      ...workspace,
      members: membersByWorkspace[workspace.$id] || [],
    })
  );

  return (
    <div className="h-fit flex flex-col border rounded-lg p-4">
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-2">
        <h1 className="text-2xl font-bold">Workspaces ({workspaces?.total})</h1>
        <Button onClick={open} size="sm" className="w-full lg:w-auto">
          <PlusIcon className="size-4 mr-2" />
          New
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      <DataFilter />

      <DottedSeparator className="my-4" />

      {isLoading ? (
        <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </div>
      ) : !workspaces || !members ? (
        <PageError message="Failed to load data" />
      ) : (
        <DataTable
          columns={columns}
          data={workspacesWithMembers as AdminWorkspace[]}
        />
      )}
    </div>
  );
};
