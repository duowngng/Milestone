import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UsePrefetchProjectMembersProps {
  workspaceId: string;
  projects: { $id: string }[] | undefined;
  shouldPrefetch: boolean;
}

export const usePrefetchProjectMembers = ({
  workspaceId,
  projects,
  shouldPrefetch,
}: UsePrefetchProjectMembersProps) => {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!shouldPrefetch || !projects) return;

    const prefetchAllMembers = async () => {
      await Promise.all(
        projects.map((project) =>
          queryClient.prefetchQuery({
            queryKey: ["projectMembers", workspaceId, project.$id],
            staleTime: 1000 * 60 * 5,
            queryFn: async () => {
              const response = await client.api.members.project.$get({
                query: { workspaceId, projectId: project.$id },
              });

              if (!response.ok) {
                throw new Error("Failed to fetch project members");
              }

              const { data } = await response.json();
              return data;
            },
          })
        )
      );
    };

    prefetchAllMembers();
  }, [shouldPrefetch, projects, workspaceId, queryClient]);
};
