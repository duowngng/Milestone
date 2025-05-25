import { Card, CardContent } from "@/components/ui/card";
import { useGetMembers } from "@/features/members/workspace/api/use-get-members";
import { useGetProjectMembers } from "@/features/members/project/api/use-get-project-members";
import { useGetProject } from "@/features/projects/api/use-get-project";
import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { Loader } from "lucide-react";

import { EditTaskForm } from "./edit-task-form";

import { useGetTask } from "../api/use-get-task";
import { useMemo } from "react";

interface EditTaskFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditTaskFormWrapper = ({
  onCancel,
  id,
}: EditTaskFormWrapperProps) => {
  const workspaceId = useWorkspaceId();

  const { data: initialValues, isLoading: isLoadingTask } = useGetTask({
    taskId: id,
  });
  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId: initialValues?.projectId || "",
  });
  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });
  const { data: projectMembers, isLoading: isLoadingProjectMembers } =
    useGetProjectMembers({
      workspaceId,
      projectId: initialValues?.projectId,
    });

  const memberOptions = useMemo(() => {
    if (
      !members?.documents ||
      !projectMembers?.documents ||
      !initialValues?.projectId
    ) {
      return [];
    }

    const projectMemberIds = new Set(
      projectMembers.documents.map((pm) => pm.userId)
    );

    return members.documents
      .filter((member) => projectMemberIds.has(member.userId))
      .map((member) => ({
        id: member.$id,
        name: member.name,
      }))
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [members?.documents, projectMembers?.documents, initialValues?.projectId]);

  const isLoading =
    isLoadingProject ||
    isLoadingMembers ||
    isLoadingProjectMembers ||
    isLoadingTask;

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
    return null;
  }

  return (
    <div>
      <EditTaskForm
        onCancel={onCancel}
        initialValues={initialValues}
        project={{
          id: project?.$id || "",
          name: project?.name || "",
          imageUrl: project?.imageUrl || "",
        }}
        memberOptions={memberOptions ?? []}
      />
    </div>
  );
};
