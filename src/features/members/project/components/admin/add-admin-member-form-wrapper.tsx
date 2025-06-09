import { Loader } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

import { useGetMembers } from "@/features/members/workspace/api/admin/use-get-admin-members";
import { useGetProject } from "@/features/projects/api/admin/use-get-admin-project";
import { AddMemberForm } from "./add-admin-member-form";
import { useGetProjectMembers } from "../../api/admin/use-get-admin-project-members";

interface AddMemberFormWrapperProps {
  onCancel: () => void;
  initialProjectId?: string;
}

export const AddMemberFormWrapper = ({
  onCancel,
  initialProjectId,
}: AddMemberFormWrapperProps) => {
  const projectId = initialProjectId || "";

  const { data: project, isLoading: isLoadingProject } = useGetProject({
    projectId,
  });

  const workspaceId = project?.workspaceId || "";

  const { data: members, isLoading: isLoadingMembers } = useGetMembers({
    workspaceId,
  });

  const { data: currentProjectMembers, isLoading: isLoadingProjectMembers } =
    useGetProjectMembers({ projectId });

  const isLoading =
    isLoadingProject || isLoadingMembers || isLoadingProjectMembers;

  const memberOptions = members?.documents.map((member) => ({
    id: member.userId,
    name: member.user.name,
    email: member.user.email,
  }));

  const formattedCurrentProjectMembers =
    currentProjectMembers?.documents.map((member) => ({
      userId: member.userId,
      name: member.user.name,
      email: member.user.email,
    })) || [];

  if (isLoading) {
    return (
      <Card className="w-full h-[300px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  console.log("memberOptions", memberOptions);
  console.log("currentProjectMembers", currentProjectMembers);
  return (
    <AddMemberForm
      onCancel={onCancel}
      projectId={projectId}
      memberOptions={memberOptions ?? []}
      currentProjectMembers={formattedCurrentProjectMembers}
    />
  );
};
