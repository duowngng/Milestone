import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.users)[":userId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.users)[":userId"]["$delete"]
>;

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.admin.users[":userId"]["$delete"]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete user");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("User deleted");
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
    onError: (error) => {
      console.error(error);
      toast.error("Failed to delete user");
    },
  });

  return mutation;
};
