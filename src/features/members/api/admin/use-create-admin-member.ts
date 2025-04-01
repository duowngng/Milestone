import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.members)["$post"],
  200
>;
type RequestType = InferRequestType<(typeof client.api.admin.members)["$post"]>;

export const useCreateMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.admin.members.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to create member");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Member created");
      queryClient.invalidateQueries({ queryKey: ["admin-members"] });
    },
    onError: () => {
      toast.error("Failed to create member");
    },
  });

  return mutation;
};
