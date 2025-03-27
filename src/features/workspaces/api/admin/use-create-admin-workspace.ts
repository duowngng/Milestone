import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.workspaces)["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.workspaces)["$post"]
>;

export const useCreateAdminWorkspace = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.admin.workspaces.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to create workspace");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Workspace created successfully");
      queryClient.invalidateQueries({ queryKey: ["admin-workspaces"] });
    },
    onError: () => {
      toast.error("Failed to create workspace");
    },
  });

  return mutation;
};
