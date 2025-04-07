"use client";

import { Loader, PlusIcon } from "lucide-react";

import { DataTable } from "@/features/projects/components/admin/data-table";
import { columns } from "@/features/projects/components/admin/columns";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { Button } from "@/components/ui/button";

import { AdminProject } from "@/features/projects/types";
import { useGetProjects } from "@/features/projects/api/admin/use-get-admin-projects";
import { useProjectFilters } from "@/features/projects/hooks/admin/use-project-filters";
import { DataFilter } from "@/features/projects/components/admin/data-filter";

export const AdminProjectsClient = () => {
  const [{ name, workspaceId, createdAt, updatedAt }] = useProjectFilters();
  const { data, isLoading } = useGetProjects({
    name,
    workspaceId,
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
    return <PageError message="Failed to load projects" />;
  }

  return (
    <div className="h-full flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects ({data?.total})</h1>
        <Button size="sm" className="w-full lg:w-auto">
          <PlusIcon className="size-4 mr-2" />
          New
        </Button>
      </div>

      <DottedSeparator className="my-4" />

      <DataFilter />

      <DottedSeparator className="my-4" />

      <DataTable columns={columns} data={data.documents as AdminProject[]} />
    </div>
  );
};
