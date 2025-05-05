import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetMemberProps {
  workspaceId: string;
  enabled?: boolean;
}

export const useGetCurrentMember = ({
  workspaceId,
  enabled = true,
}: useGetMemberProps) => {
  const query = useQuery({
    queryKey: ["member", workspaceId],
    queryFn: async () => {
      const response = await client.api.members.workspace.current.$get({
        query: { workspaceId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch current member");
      }

      const { data } = await response.json();

      return data;
    },
    enabled: enabled && Boolean(workspaceId),
  });

  return query;
};
