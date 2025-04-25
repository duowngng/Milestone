import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.members.workspace)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.members.workspace)[":memberId"]["$delete"]
>;

export const useDeleteMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.admin.members.workspace[":memberId"][
        "$delete"
      ]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete member");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Member deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-member", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to delete member");
    },
  });

  return mutation;
};
