import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type Responsetype = InferResponseType<typeof client.api.tasks[":taskId"]["$delete"], 200>;
type RequestType = InferRequestType<typeof client.api.tasks[":taskId"]["$delete"]>;

export const useDeleteTask = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<
  Responsetype,
  Error,
  RequestType
  >({
    mutationFn: async ({ param }) => {
      const response = await client.api.tasks[":taskId"]["$delete"]({ param });

      if (!response.ok) {
        throw new Error("Failed to delete task");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Task deleted");
      queryClient.invalidateQueries({ queryKey: ["tasks"]});
      queryClient.invalidateQueries({ queryKey: ["task", data.$id]});
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete task");
    },
  });

  return mutation;
}
