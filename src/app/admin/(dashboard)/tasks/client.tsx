"use client";

import { Loader, PlusIcon } from "lucide-react";

import { DataTable } from "@/features/tasks/components/admin/data-table";
import { DataFilter } from "@/features/tasks/components/admin/data-filter";
import { columns } from "@/features/tasks/components/admin/columns";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { Button } from "@/components/ui/button";

import { useGetAdminTasks } from "@/features/tasks/api/admin/use-get-admin-tasks";
import { useAdminTaskFilters } from "@/features/tasks/hooks/admin/use-task-filters";
import { useCreateTaskModal } from "@/features/tasks/hooks/use-create-task-modal";

export const AdminTasksClient = () => {
  const [
    {
      projectId,
      assigneeId,
      status,
      priority,
      name,
      startDate,
      dueDate,
      progress,
      createdAt,
      updatedAt,
    },
  ] = useAdminTaskFilters();

  const { data, isLoading } = useGetAdminTasks({
    projectId,
    assigneeId,
    status,
    priority,
    name,
    startDate,
    dueDate,
    progress,
    createdAt,
    updatedAt,
  });

  const { open } = useCreateTaskModal();

  return (
    <div className="h-fit flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Tasks ({data?.total})</h1>
        <Button onClick={() => open()} size="sm" className="w-full lg:w-auto">
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
      ) : !data ? (
        <PageError message="Failed to load data" />
      ) : (
        <DataTable columns={columns} data={data.documents} />
      )}
    </div>
  );
};
