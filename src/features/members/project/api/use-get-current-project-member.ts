import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetCurrentProjectMemberProps {
  projectId: string;
  workspaceId: string;
  enabled?: boolean;
}

export const useGetCurrentProjectMember = ({
  projectId,
  workspaceId,
  enabled = true,
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
    enabled: enabled && Boolean(workspaceId) && Boolean(projectId),
  });

  return query;
};
