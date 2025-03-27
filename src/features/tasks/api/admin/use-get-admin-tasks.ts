import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { TaskStatus } from "../types";

interface UseGetAdminTasksProps {
  projectId?: string | null;
  status?: TaskStatus | null;
  search?: string | null;
  assigneeId?: string | null;
  dueDate?: string | null;
}

export const useGetAdminTasks = ({
  projectId,
  status,
  search,
  assigneeId,
  dueDate,
}: UseGetAdminTasksProps = {}) => {
  const query = useQuery({
    queryKey: ["admin-tasks", projectId, status, search, assigneeId, dueDate],
    queryFn: async () => {
      const response = await client.api.admin.tasks.$get({
        query: {
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          dueDate: dueDate ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch admin tasks");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
