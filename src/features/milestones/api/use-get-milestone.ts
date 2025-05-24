import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMilestoneProps {
  milestoneId: string;
  enabled?: boolean;
}

export const useGetMilestone = ({
  milestoneId,
  enabled = true,
}: UseGetMilestoneProps) => {
  const query = useQuery({
    queryKey: ["milestone", milestoneId],
    queryFn: async () => {
      const response = await client.api.milestones[":milestoneId"].$get({
        param: { milestoneId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch milestone");
      }

      const { data } = await response.json();
      return data;
    },
    enabled: enabled && Boolean(milestoneId),
  });

  return query;
};
