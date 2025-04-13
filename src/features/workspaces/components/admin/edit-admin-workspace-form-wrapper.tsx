import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetUsers } from "@/features/users/api//admin/use-get-admin-users";
import { EditAdminWorkspaceForm } from "./edit-admin-workspace-form";
import { useGetWorkspace } from "../../api/admin/use-get-admin-workspace";

interface EditAdminWorkspaceFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditAdminWorkspaceFormWrapper = ({
  onCancel,
  id,
}: EditAdminWorkspaceFormWrapperProps) => {
  const { data: initialValues, isLoading: isLoadingWorkspace } =
    useGetWorkspace({ workspaceId: id });
  const { data: users, isLoading: isLoadingUsers } = useGetUsers();

  const userOptions = users?.users.map((user) => ({
    id: user.$id,
    name: user.name,
  }));

  const isLoading = isLoadingUsers || isLoadingWorkspace;

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
    <EditAdminWorkspaceForm
      initialValues={initialValues}
      users={userOptions ?? []}
      onCancel={onCancel}
    />
  );
};
