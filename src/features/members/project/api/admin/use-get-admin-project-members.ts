import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectMembersProps {
  userId?: string | null;
  projectId?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const useGetProjectMembers = ({
  userId,
  projectId,
  role,
  createdAt,
  updatedAt,
}: UseGetProjectMembersProps = {}) => {
  return useQuery({
    queryKey: [
      "admin-project-members",
      userId,
      projectId,
      role,
      createdAt,
      updatedAt,
    ],
    queryFn: async () => {
      const response = await client.api.admin.members.project.$get({
        query: {
          userId: userId ?? undefined,
          projectId: projectId ?? undefined,
          role: role ?? undefined,
          createdAt: createdAt ?? undefined,
          updatedAt: updatedAt ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project members");
      }

      const { data } = await response.json();

      return data;
    },
  });
};
