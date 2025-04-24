import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface useGetHistoriesProps {
  taskId: string;
}

export const useGetHistories = ({ taskId }: useGetHistoriesProps) => {
  const query = useQuery({
    queryKey: ["history", taskId],
    queryFn: async () => {
      const response = await client.api.histories[":taskId"].$get({
        param: { taskId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch history");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
