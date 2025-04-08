import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetWorkspaces } from "@/features/workspaces/api/admin/use-get-admin-workspaces";
import { EditAdminProjectForm } from "./edit-admin-project-form";
import { useGetProject } from "../../api/admin/use-get-admin-project";

interface EditAdminProjectFormWrapperProps {
  onCancel: () => void;
  id: string;
}

export const EditAdminProjectFormWrapper = ({
  onCancel,
  id,
}: EditAdminProjectFormWrapperProps) => {
  const { data: initialValues, isLoading: isLoadingProject } = useGetProject({
    projectId: id,
  });
  const { data: workspaces, isLoading: isLoadingWorkspaces } =
    useGetWorkspaces();

  const workspaceOptions = workspaces?.documents.map((workspace) => ({
    id: workspace.$id,
    name: workspace.name,
  }));

  const isLoading = isLoadingProject || isLoadingWorkspaces;

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
    <EditAdminProjectForm
      initialValues={initialValues}
      workspaces={workspaceOptions ?? []}
      onCancel={onCancel}
    />
  );
};
