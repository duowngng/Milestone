import { Loader } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { useGetMembers } from "@/features/members/workspace/api/use-get-members";
import { useGetProjects } from "@/features/projects/api/use-get-projects";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

import { CreateTaskForm } from "./create-task-form";
import { TaskStatus } from "../types";

interface CreateTaskFormWrapperProps {
  onCancel: () => void;
  initialStatus?: TaskStatus;
  initialProjectId?: string;
}

export const CreateTaskFormWrapper = ({
  onCancel,
  initialStatus,
  initialProjectId,
}: CreateTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const projectOptions = projects?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
    imageUrl: project.imageUrl,
  }));

  const memberOptions = members?.documents.map((member) => ({
    id: member.$id,
    name: member.name,
  }));

  const isLoading = isLoadingProjects || isLoadingMembers;

  if (isLoading) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <div>
      <CreateTaskForm
        onCancel={onCancel}
        projectOptions={projectOptions ?? []}
        memberOptions={memberOptions ?? []}
        initialStatus={initialStatus}
        initialProjectId={initialProjectId}
      />
    </div>
  );
};
