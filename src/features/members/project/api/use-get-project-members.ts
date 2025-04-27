import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetProjectMembersProps {
  projectId: string;
  workspaceId: string;
}

export const useGetProjectMembers = ({
  projectId,
  workspaceId,
}: useGetProjectMembersProps) => {
  const query = useQuery({
    queryKey: ["projectMembers", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.members.project.$get({
        query: { workspaceId, projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch project members");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
