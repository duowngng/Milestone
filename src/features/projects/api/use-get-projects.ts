import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetProjectsProps {
  workspaceId: string;
  memberOnly?: boolean;
  enabled?: boolean;
}

export const useGetProjects = ({
  workspaceId,
  memberOnly = false,
  enabled = true,
}: useGetProjectsProps) => {
  const query = useQuery({
    queryKey: ["projects", workspaceId, memberOnly],
    queryFn: async () => {
      const response = await client.api.projects.$get({
        query: { workspaceId, memberOnly: memberOnly.toString() },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: enabled && Boolean(workspaceId),
  });

  return query;
};
