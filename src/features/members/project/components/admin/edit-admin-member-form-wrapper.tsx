import { Card, CardContent } from "@/components/ui/card";
import { Loader } from "lucide-react";

import { useGetUsers } from "@/features/users/api/admin/use-get-admin-users";
import { useGetProjects } from "@/features/projects/api/admin/use-get-admin-projects";
import { useGetProjectMember } from "../../api/admin/use-get-admin-project-member";
import { EditAdminProjectMemberForm } from "./edit-admin-member-form";

interface EditAdminProjectMemberFormWrapperProps {
  id: string;
  onCancel: () => void;
}

export const EditAdminProjectMemberFormWrapper = ({
  id,
  onCancel,
}: EditAdminProjectMemberFormWrapperProps) => {
  const { data: initialValues, isLoading: isLoadingMember } =
    useGetProjectMember({
      memberId: id,
    });
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers();
  const { data: projectsData, isLoading: isLoadingProjects } = useGetProjects();

  const userOptions = usersData?.users.map((user) => ({
    id: user.$id,
    name: user.name,
  }));

  const projectOptions = projectsData?.documents.map((project) => ({
    id: project.$id,
    name: project.name,
  }));

  const isLoading = isLoadingUsers || isLoadingProjects || isLoadingMember;

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
    <EditAdminProjectMemberForm
      users={userOptions ?? []}
      projects={projectOptions ?? []}
      initialValues={initialValues}
      onCancel={onCancel}
    />
  );
};
