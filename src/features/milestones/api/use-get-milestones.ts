import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMilestonesProps {
  workspaceId: string;
  projectId?: string;
  enabled?: boolean;
}

export const useGetMilestones = ({
  workspaceId,
  projectId,
  enabled = true,
}: UseGetMilestonesProps) => {
  const query = useQuery({
    queryKey: ["milestones", workspaceId, projectId],
    queryFn: async () => {
      const response = await client.api.milestones.$get({
        query: {
          workspaceId,
          ...(projectId && { projectId }),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch milestones");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: enabled && Boolean(workspaceId),
  });

  return query;
};
