import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

import { useWorkspaceId } from "@/features/workspaces/hooks/use-workspace-id";

type ResponseType = InferResponseType<
  (typeof client.api.members.project)[":memberId"]["$delete"],
  200
>;
type RequestType = InferRequestType<
  (typeof client.api.members.project)[":memberId"]["$delete"]
> & { projectId: string };

export const useDeleteProjectMember = () => {
  const queryClient = useQueryClient();
  const workspaceId = useWorkspaceId();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ param }) => {
      const response = await client.api.members.project[":memberId"]["$delete"](
        {
          param,
        }
      );

      if (!response.ok) {
        throw new Error("Failed to delete project member");
      }

      return await response.json();
    },
    onSuccess: (_, variables) => {
      const { projectId } = variables;
      toast.success("Project member deleted");
      queryClient.invalidateQueries({
        queryKey: ["projectMembers", workspaceId, projectId],
      });
    },
    onError: () => {
      toast.error("Failed to delete project member");
    },
  });

  return mutation;
};
