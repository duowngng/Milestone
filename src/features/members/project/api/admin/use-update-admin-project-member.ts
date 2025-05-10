import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.members.project)[":memberId"]["$patch"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.members.project)[":memberId"]["$patch"]
>;

export const useUpdateProjectMember = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ form, param }) => {
      const response = await client.api.admin.members.project[":memberId"][
        "$patch"
      ]({
        form,
        param,
      });

      if (!response.ok) {
        throw new Error("Failed to update project member");
      }

      return await response.json();
    },
    onSuccess: ({ data }) => {
      toast.success("Project member updated");
      queryClient.invalidateQueries({ queryKey: ["admin-project-members"] });
      queryClient.invalidateQueries({
        queryKey: ["admin-project-member", data.$id],
      });
    },
    onError: () => {
      toast.error("Failed to update project member");
    },
  });

  return mutation;
};
