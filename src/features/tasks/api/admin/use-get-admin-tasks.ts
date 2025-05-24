import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";
import { TaskPriority, TaskStatus } from "../../types";

interface UseGetAdminTasksProps {
  projectId?: string | null;
  assigneeId?: string | null;
  status?: TaskStatus | null;
  priority?: TaskPriority | null;
  name?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  progress?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export const useGetAdminTasks = ({
  projectId,
  assigneeId,
  status,
  priority,
  name,
  startDate,
  dueDate,
  progress,
  createdAt,
  updatedAt,
}: UseGetAdminTasksProps = {}) => {
  const query = useQuery({
    queryKey: [
      "admin-tasks",
      projectId,
      assigneeId,
      status,
      priority,
      name,
      startDate,
      dueDate,
      progress,
      createdAt,
      updatedAt,
    ],
    queryFn: async () => {
      const response = await client.api.admin.tasks.$get({
        query: {
          projectId: projectId ?? undefined,
          assigneeId: assigneeId ?? undefined,
          status: status ?? undefined,
          priority: priority ?? undefined,
          name: name ?? undefined,
          startDate: startDate ?? undefined,
          dueDate: dueDate ?? undefined,
          progress: progress ?? undefined,
          createdAt: createdAt ?? undefined,
          updatedAt: updatedAt ?? undefined,
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
