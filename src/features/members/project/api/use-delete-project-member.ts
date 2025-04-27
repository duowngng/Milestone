import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.members.project)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members.project)[":memberId"]["$delete"]
>;

export const useDeleteProjectMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.members.project[":memberId"]["$delete"](
        {
          param,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project member");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project member deleted");
      queryClient.invalidateQueries({ queryKey: ["projectMembers"] });
    },
    onError: () => {
      toast.error("Failed to delete project member");
    },
  });

  return mutation;
};
