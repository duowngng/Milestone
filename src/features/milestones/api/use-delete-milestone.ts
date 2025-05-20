import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.milestones)[":milestoneId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.milestones)[":milestoneId"]["$delete"]
>;

export const useDeleteMilestone = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.milestones[":milestoneId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete milestone");
      }

      const data = await response.json();
      return { ...data };
    },
    onSuccess: ({ data }) => {
      toast.success("Milestone deleted");
      queryClient.invalidateQueries({
        queryKey: ["milestones", data.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestones", data.workspaceId, data.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestone", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to delete milestone");
    },
  });

  return mutation;
};
