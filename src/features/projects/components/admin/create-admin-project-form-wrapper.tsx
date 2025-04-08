import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { CreateAdminProjectForm } from "./create-admin-project-form";

interface CreateAdminProjectFormWrapperProps {
  onCancel: () => void;
}

export const CreateAdminProjectFormWrapper = ({
  onCancel,
}: CreateAdminProjectFormWrapperProps) => {
  const { data, isLoading } = useGetWorkspaces();

  const workspaceOptions = data?.documents.map((workspace) => ({
    id: workspace.$id,
    name: workspace.name,
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
    <CreateAdminProjectForm
      workspaces={workspaceOptions ?? []}
      onCancel={onCancel}
    />
  );
};
