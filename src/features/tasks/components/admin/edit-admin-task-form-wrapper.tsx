"use client";

import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { useGetProjects } from "@/features/projects/api/admin/use-get-admin-projects";
import { useGetMembers } from "@/features/members/workspace/api/admin/use-get-admin-members";
import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";

import { useGetTask } from "../../api/admin/use-get-admin-task";
import { EditAdminTaskForm } from "./edit-admin-task-form";

interface EditAdminTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditAdminTaskFormWrapper = ({
  onCancel,
  id,
}: EditAdminTaskFormWrapperProps) => {
  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });
  const { data: projects, isLoading: isLoadingProjects } = useGetProjects();
  const { data: members, isLoading: isLoadingMembers } = useGetMembers();
  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    useGetWorkspaces();

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name || member.email,
  }));

  const workspaceOptions = workspaces?.documents.map((workspace) => ({
    id: workspace.$id,
    name: workspace.name,
  }));

  const isLoading =
    isLoadingTask ||
    isLoadingProjects ||
    isLoadingMembers ||
    isLoadingWorkspaces;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!initialValues) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <p className="text-muted-foreground">Task not found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <EditAdminTaskForm
      projectOptions={projectOptions || []}
      memberOptions={memberOptions || []}
      workspaceOptions={workspaceOptions || []}
      initialValues={initialValues}
      onCancel={onCancel}
    />
  );
};
