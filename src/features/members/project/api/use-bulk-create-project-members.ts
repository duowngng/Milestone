import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

type ResponseType = InferResponseType<
  (typeof client.api.members.project)["bulk-create"]["$post"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members.project)["bulk-create"]["$post"]
>;

export const useBulkCreateProjectMembers = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      console.log("POST /members/project/bulk-create", json);
      const response = await client.api.members.project["bulk-create"]["$post"](
        { json }
      );

      if (!response.ok) {
        throw new Error("Failed to add members to the project");
      }

      return await response.json();
    },
    onSuccess: (_, { json }) => {
      const { projectId } = json;
      toast.success("Members added to the project");
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", workspaceId, projectId],
      });
    },
    onError: (error) => {
      console.error("Error adding members:", error);
      toast.error("Failed to add members to the project");
    },
  });

  return mutation;
};
