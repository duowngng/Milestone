"use client";

import { useState } from "react";

import { Loader } from "lucide-react";

import { DataTable } from "@/features/workspaces/components/admin/data-table";
import { DataFilter } from "@/features/workspaces/components/admin/data-filter";
import { columns } from "@/features/workspaces/components/admin/columns";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";

import { AdminWorkspace } from "@/features/workspaces/types";
import { useGetAdminWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { useWorkspaceFilters } from "@/features/workspaces/api/admin/use-workspace-filters";

export const AdminWorkspacesClient = () => {
  const [{ name, userId, createdAt, updatedAt }] = useWorkspaceFilters();
  const { data, isLoading } = useGetAdminWorkspaces({
    name,
    userId,
    createdAt,
    updatedAt,
  });

  if (isLoading) {
    return (
      <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!data) {
    return <PageError message="Failed to load workspaces" />;
  }

  return (
    <div className="h-full flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Workspaces ({data?.total})</h1>
      </div>

      <DottedSeparator className="my-4" />

      <DataFilter
        users={Array.from(
          new Map(
            data?.documents.map((workspace) => [
              workspace.userId,
              {
                id: workspace.userId,
                name: workspace.user?.name,
              },
            ])
          ).values()
        )}
      />

      <DottedSeparator className="my-4" />

      <DataTable columns={columns} data={data.documents as AdminWorkspace[]} />
    </div>
  );
};
