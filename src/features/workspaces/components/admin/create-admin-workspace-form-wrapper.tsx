import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetAdminUsers } from "@/features/users/api//admin/use-get-admin-users";
import { CreateAdminWorkspaceForm } from "./create-admin-workspace-form";

interface CreateAdminWorkspaceFormWrapperProps {
  onCancel: () => void;
}

export const CreateAdminWorkspaceFormWrapper = ({
  onCancel,
}: CreateAdminWorkspaceFormWrapperProps) => {
  const { data, isLoading } = useGetAdminUsers();

  const userOptions = data?.users.map((user) => ({
    id: user.$id,
    name: user.name,
  }));

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
    <CreateAdminWorkspaceForm users={userOptions ?? []} onCancel={onCancel} />
  );
};
