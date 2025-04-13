import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectsProps {
  name?: string | null;
  workspaceId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const useGetProjects = ({
  name,
  workspaceId,
  createdAt,
  updatedAt,
}: UseGetProjectsProps = {}) => {
  const query = useQuery({
    queryKey: ["admin-projects", name, workspaceId, createdAt, updatedAt],
    queryFn: async () => {
      const response = await client.api.admin.projects.$get({
        query: {
          name: name ?? undefined,
          workspaceId: workspaceId ?? undefined,
          createdAt: createdAt ?? undefined,
          updatedAt: updatedAt ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin projects");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
