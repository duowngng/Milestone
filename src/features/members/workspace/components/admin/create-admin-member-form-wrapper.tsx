import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";
import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { CreateAdminMemberForm } from "./create-admin-member-form";

interface CreateAdminMemberFormWrapperProps {
  onCancel: () => void;
}

export const CreateAdminMemberFormWrapper = ({
  onCancel,
}: CreateAdminMemberFormWrapperProps) => {
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

  if (isLoadingUsers || isLoadingWorkspaces) {
    return (
      <Card className="w-full h-[714px] border-none shadow-none">
        <CardContent className="flex items-center justify-center h-full">
          <Loader className="size-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <CreateAdminMemberForm
      users={userOptions ?? []}
      workspaces={workspaceOptions ?? []}
      onCancel={onCancel}
    />
  );
};
