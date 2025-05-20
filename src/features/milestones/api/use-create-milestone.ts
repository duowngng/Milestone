import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.milestones)["$post"],
  200
>;
type RequestType = InferRequestType<(typeof client.api.milestones)["$post"]>;

export const useCreateMilestone = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.milestones["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create milestone");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Milestone created");
      queryClient.invalidateQueries({
        queryKey: ["milestones", data.workspaceId],
      });
      queryClient.invalidateQueries({
        queryKey: ["milestones", data.workspaceId, data.projectId],
      });
    },
    onError: () => {
      toast.error("Failed to create milestone");
    },
  });

  return mutation;
};
