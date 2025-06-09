import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectMembersProps {
  projectId?: string | null;
}

export const useGetProjectMembers = ({
  projectId,
}: UseGetProjectMembersProps = {}) => {
  return useQuery({
    queryKey: ["admin-project-members", projectId],
    queryFn: async () => {
      const response = await client.api.admin.members.project.$get({
        query: {
          projectId: projectId ?? undefined,
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
