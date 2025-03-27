import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.workspaces)[":workspaceId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.workspaces)[":workspaceId"]["$delete"]
>;

export const useDeleteAdminWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.admin.workspaces[":workspaceId"][
        "$delete"
      ]({
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to delete workspace");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Workspace deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] });
    },
    onError: () => {
      toast.error("Failed to delete workspace");
    },
  });

  return mutation;
};
