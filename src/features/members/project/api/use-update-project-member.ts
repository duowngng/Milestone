import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.members.project)[":memberId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members.project)[":memberId"]["$patch"]
>;

export const useUpdateProjectMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param, json }) => {
      const response = await client.api.members.project[":memberId"]["$patch"]({
        param,
        json,
      });

      if (!response.ok) {
        throw new Error("Failed to update project member");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project member updated");
      queryClient.invalidateQueries({ queryKey: ["projectMembers"] });
    },
    onError: () => {
      toast.error("Failed to update project member");
    },
  });

  return mutation;
};
