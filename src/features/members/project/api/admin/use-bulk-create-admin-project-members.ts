import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.admin.members.project)["bulk-create"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.admin.members.project)["bulk-create"]["$post"]
>;

export const useBulkCreateAdminProjectMembers = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.admin.members.project["bulk-create"][
        "$post"
      ]({ json });

      if (!response.ok) {
        throw new Error("Failed to add members to the project");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("Members added to the project");
      queryClient.invalidateQueries({ queryKey: ["admin-project-members"] });
    },
    onError: () => {
      toast.error("Failed to add members to the project");
    },
  });

  return mutation;
};
