import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { InferRequestType, InferResponseType } from "hono";

import { client } from "@/lib/rpc";

type ResponseType = InferResponseType<
  (typeof client.api.histories)["$post"],
  200
>;
type RequestType = InferRequestType<(typeof client.api.histories)["$post"]>;

export const useCreateHistory = () => {
  const queryClient = useQueryClient();

  const mutation = useMutation<ResponseType, Error, RequestType>({
    mutationFn: async ({ json }) => {
      const response = await client.api.histories["$post"]({ json });

      if (!response.ok) {
        throw new Error("Failed to create history");
      }

      return await response.json();
    },
    onSuccess: () => {
      toast.success("History created");
      queryClient.invalidateQueries({ queryKey: ["history"] });
    },
    onError: () => {
      toast.error("Failed to create history");
    },
  });

  return mutation;
};
