"use client";

import { Loader, PlusIcon } from "lucide-react";

import { DataTable } from "@/features/projects/components/admin/data-table";
import { DataFilter } from "@/features/projects/components/admin/data-filter";
import { columns } from "@/features/projects/components/admin/columns";
import { DottedSeparator } from "@/components/dotted-separator";
import { PageError } from "@/components/page-error";
import { Button } from "@/components/ui/button";

import { AdminProject } from "@/features/projects/types";
import { useGetProjects } from "@/features/projects/api/admin/use-get-admin-projects";
import { useProjectFilters } from "@/features/projects/hooks/admin/use-project-filters";
import { useCreateProjectModal } from "@/features/projects/hooks/use-create-project-modal";
import { useGetProjectMembers } from "@/features/members/project/api/admin/use-get-admin-project-members";
import { AdminProjectMember } from "@/features/members/types";

export const AdminProjectsClient = () => {
  const [{ name, workspaceId, createdAt, updatedAt }] = useProjectFilters();
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    name,
    workspaceId,
    createdAt,
    updatedAt,
  });

  const { data: members, isLoading: isLoadingMembers } = useGetProjectMembers();

  const isLoading = isLoadingProjects || isLoadingMembers;

  const { open } = useCreateProjectModal();

  if (isLoading) {
    return (
      <div className="w-full border rounded-lg h-[200px] flex flex-col items-center justify-center">
        <Loader className="size-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!projects || !members) {
    return <PageError message="Failed to load data" />;
  }

  const membersByProject: Record<string, AdminProjectMember[]> = {};
  members.documents.forEach((member: AdminProjectMember) => {
    if (!membersByProject[member.projectId]) {
      membersByProject[member.projectId] = [];
    }
    membersByProject[member.projectId].push(member);
  });

  const projectsWithMembers = projects.documents.map(
    (project: AdminProject) => ({
      ...project,
      members: membersByProject[project.$id] || [],
    })
  );

  return (
    <div className="h-fit flex flex-col border rounded-lg p-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Projects ({projects?.total})</h1>
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
        data={projectsWithMembers as AdminProject[]}
      />
    </div>
  );
};
