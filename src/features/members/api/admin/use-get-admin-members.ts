import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMembersProps {
  userId?: string | null;
  workspaceId?: string | null;
  role?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const useGetMembers = ({
  userId,
  workspaceId,
  role,
  createdAt,
  updatedAt,
}: UseGetMembersProps = {}) => {
  return useQuery({
    queryKey: [
      "admin-members",
      userId,
      workspaceId,
      role,
      createdAt,
      updatedAt,
    ],
    queryFn: async () => {
      const response = await client.api.admin.members.$get({
        query: {
          userId: userId ?? undefined,
          workspaceId: workspaceId ?? undefined,
          role: role ?? undefined,
          createdAt: createdAt ?? undefined,
          updatedAt: updatedAt ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const { data } = await response.json();

      return data;
    },
  });
};
