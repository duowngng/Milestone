import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetTasksProps {
  workspaceId: string;
  projectId?: string | null;
  status?: string | null;
  priority?: string | null;
  search?: string | null;
  assigneeId?: string | null;
  startDate?: string | null;
  dueDate?: string | null;
  progress?: string | null;
}

export const useGetTasks = ({
  workspaceId,
  projectId,
  status,
  priority,
  search,
  assigneeId,
  startDate,
  dueDate,
  progress,
}: useGetTasksProps) => {
  const query = useQuery({
    queryKey: [
      "tasks",
      workspaceId,
      projectId,
      status,
      priority,
      search,
      assigneeId,
      startDate,
      dueDate,
      progress,
    ],
    queryFn: async () => {
      const response = await client.api.tasks.$get({
        query: {
          workspaceId,
          projectId: projectId ?? undefined,
          status: status ?? undefined,
          priority: priority ?? undefined,
          search: search ?? undefined,
          assigneeId: assigneeId ?? undefined,
          startDate: startDate ?? undefined,
          dueDate: dueDate ?? undefined,
          progress: progress ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
