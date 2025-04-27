import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetMemberProps {
  workspaceId: string;
}

export const useGetCurrentMember = ({ workspaceId }: useGetMemberProps) => {
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
  });

  return query;
};
