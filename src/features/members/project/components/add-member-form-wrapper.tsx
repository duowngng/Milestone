import { Loader } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";
import { useGetMembers } from "@/features/members/workspace/api/use-get-members";
import { useProjectSelect } from "../hooks/use-project-select";

import { AddMemberForm } from "./add-member-form";
import { useGetProjectMembers } from "../api/use-get-project-members";

interface AddMemberFormWrapperProps {
  onCancel: () => void;
}

export const AddMemberFormWrapper = ({
  onCancel,
}: AddMemberFormWrapperProps) => {
  const workspaceId = useWorkspaceId();
  const [{ projectId }] = useProjectSelect();

  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const { data: currentProjectMembers, isLoading: isLoadingProjectMembers } =
    useGetProjectMembers({
      projectId: projectId ?? "",
      workspaceId,
    });

  const isLoading = isLoadingMembers || isLoadingProjectMembers;

  const memberOptions = members?.documents.map((member) => ({
    id: member.userId,
    name: member.name,
    email: member.email,
  }));

  if (isLoading) {
    return (
      <Card className="w-full h-[300px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <AddMemberForm
      onCancel={onCancel}
      projectId={projectId ?? ""}
      memberOptions={memberOptions ?? []}
      currentProjectMembers={currentProjectMembers?.documents ?? []}
    />
  );
};
