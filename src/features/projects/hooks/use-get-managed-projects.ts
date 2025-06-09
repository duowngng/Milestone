import { useMemo } from "react";

import { useGetProjectMembers } from "@/features/members/project/api/use-get-project-members";
import { useCurrent } from "@/features/auth/api/use-current";
import { MemberRole, ProjectMember } from "@/features/members/types";

import { useGetProjects } from "../api/use-get-projects";

interface UseGetManagedProjectsProps {
  workspaceId: string;
}

export const useGetManagedProjects = ({
  workspaceId,
}: UseGetManagedProjectsProps) => {
  const { data: currentUser, isLoading: isLoadingCurrentUser } = useCurrent();

  const { data: projects, isLoading: isLoadingProjects } = useGetProjects({
    workspaceId,
  });

  const { data: allProjectMembers, isLoading: isLoadingProjectMembers } =
    useGetProjectMembers({
      workspaceId,
    });

  const managedProjects = useMemo(() => {
    if (!projects?.documents || !allProjectMembers?.documents || !currentUser) {
      return [];
    }

    const membersByProject = allProjectMembers.documents.reduce(
      (acc, member) => {
        if (!acc[member.projectId]) {
          acc[member.projectId] = [];
        }
        acc[member.projectId].push(member);
        return acc;
      },
      {} as Record<string, ProjectMember[]>
    );

    return projects.documents
      .filter((project) => {
        const projectMembers = membersByProject[project.$id] || [];
        return projectMembers.some(
          (member) =>
            member.userId === currentUser.$id &&
            member.role === MemberRole.MANAGER
        );
      })
      .map((project) => ({
        ...project,
        id: project.$id,
      }));
  }, [projects?.documents, allProjectMembers?.documents, currentUser]);

  const isLoading =
    isLoadingProjects || isLoadingProjectMembers || isLoadingCurrentUser;

  return {
    data: managedProjects,
    isLoading,
  };
};
