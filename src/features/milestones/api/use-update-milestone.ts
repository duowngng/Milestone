import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.milestones)[":milestoneId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.milestones)[":milestoneId"]["$patch"]
>;

export const useUpdateMilestone = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json, param }) => {
      const response = await client.api.milestones[":milestoneId"]["$patch"]({
        json,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update milestone");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Milestone updated");
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
      toast.error("Failed to update milestone");
    },
  });

  return mutation;
};
