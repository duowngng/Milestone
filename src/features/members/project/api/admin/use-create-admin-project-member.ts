import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.members.project)["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.members.project)["$post"]
>;

export const useCreateProjectMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form }) => {
      const response = await client.api.admin.members.project.$post({ form });

      if (!response.ok) {
        throw new Error("Failed to create project member");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Project member created");
      queryClient.invalidateQueries({ queryKey: ["admin-project-members"] });
    },
    onError: () => {
      toast.error("Failed to create project member");
    },
  });

  return mutation;
};
