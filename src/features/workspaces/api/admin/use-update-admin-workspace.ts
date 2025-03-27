import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.workspaces)[":workspaceId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.workspaces)[":workspaceId"]["$patch"]
>;

export const useUpdateAdminWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.admin.workspaces[":workspaceId"][
        "$patch"
      ]({
        form,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update workspace");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Workspace updated successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] });
    },
    onError: () => {
      toast.error("Failed to update workspace");
    },
  });

  return mutation;
};
