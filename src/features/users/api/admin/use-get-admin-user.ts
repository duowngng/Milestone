import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetUserProps {
  userId: string;
}

export const useGetUser = ({ userId }: UseGetUserProps) => {
  const query = useQuery({
    queryKey: ["user", userId],
    queryFn: async () => {
      const response = await client.api.admin.users[":userId"].$get({
        param: { userId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch user data");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
