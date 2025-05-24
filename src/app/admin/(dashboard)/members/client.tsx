"use client";

import { Loader, PlusIcon } from "lucide-react";

import { DataTable } from "@/features/members/workspace/components/admin/data-table";
import { DataFilter } from "@/features/members/workspace/components/admin/data-filter";
import { columns } from "@/features/members/workspace/components/admin/columns";
import { useCreateMemberModal } from "@/features/members/workspace/hooks/use-create-member-modal";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { Button } from "@/components/ui/button";

import { AdminWorkspaceMember } from "@/features/members/types";
import { useGetMembers } from "@/features/members/workspace/api/admin/use-get-admin-members";
import { useMemberFilters } from "@/features/members/workspace/hooks/admin/use-member-filters";

export const AdminMembersClient = () => {
  const [{ userId, workspaceId, role, createdAt, updatedAt }] =
    useMemberFilters();
  const { data, isLoading } = useGetMembers({
    userId,
    workspaceId,
    role,
    createdAt,
    updatedAt,
  });

  const { open } = useCreateMemberModal();

  if (isLoading) {
    return (
      <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <PageError message="Failed to load members" />;
  }

  return (
    <div className="h-full flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Members ({data?.total})</h1>
        <Button onClick={open} size="sm" className="w-full lg:w-auto">
          <PlusIcon className="size-4 mr-2" />
          New
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      <DataFilter />

      <DottedSeparator className="my-4" />

      <DataTable
        columns={columns}
        data={data.documents as AdminWorkspaceMember[]}
      />
    </div>
  );
};
