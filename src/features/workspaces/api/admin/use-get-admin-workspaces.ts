import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetAdminWorkspacesProps {
  name?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const useGetAdminWorkspaces = ({
  name,
  userId,
  createdAt,
  updatedAt,
}: UseGetAdminWorkspacesProps = {}) => {
  const query = useQuery({
    queryKey: ["admin-workspaces", name, userId, createdAt, updatedAt],
    queryFn: async () => {
      const response = await client.api.admin.workspaces.$get({
        query: {
          name: name ?? undefined,
          userId: userId ?? undefined,
          createdAt: createdAt ?? undefined,
          updatedAt: updatedAt ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin workspaces");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
