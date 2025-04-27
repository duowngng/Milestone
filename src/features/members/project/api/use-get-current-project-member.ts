import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetCurrentProjectMemberProps {
  projectId: string;
  workspaceId: string;
}

export const useGetCurrentProjectMember = ({
  projectId,
  workspaceId,
}: useGetCurrentProjectMemberProps) => {
  const query = useQuery({
    queryKey: ["currentProjectMember", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.members.project.current.$get({
        query: { workspaceId, projectId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current project member");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
