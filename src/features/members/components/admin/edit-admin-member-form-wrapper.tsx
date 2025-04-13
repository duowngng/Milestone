import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";
import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { useGetMember } from "@/features/members/api/admin/use-get-admin-member";
import { EditAdminMemberForm } from "./edit-admin-member-form";

interface EditAdminMemberFormWrapperProps {
  id: string;
  onCancel: () => void;
}

export const EditAdminMemberFormWrapper = ({
  id,
  onCancel,
}: EditAdminMemberFormWrapperProps) => {
  const { data: initialValues, isLoading: isLoadingMember } = useGetMember({
    memberId: id,
  });
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers();
  const { data: workspacesData, isLoading: isLoadingWorkspaces } =
    useGetWorkspaces();

  const userOptions = usersData?.users.map((user) => ({
    id: user.$id,
    name: user.name,
  }));

  const workspaceOptions = workspacesData?.documents.map((workspace) => ({
    id: workspace.$id,
    name: workspace.name,
  }));

  const isLoading = isLoadingUsers || isLoadingWorkspaces || isLoadingMember;

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
    <EditAdminMemberForm
      users={userOptions ?? []}
      workspaces={workspaceOptions ?? []}
      initialValues={initialValues}
      onCancel={onCancel}
    />
  );
};
