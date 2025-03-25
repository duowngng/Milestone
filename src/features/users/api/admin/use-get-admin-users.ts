import { useQuery } from "@tanstack/react-query";
import { client } from "@/lib/rpc";

interface UseGetAdminUsersProps {
  search?: string;
  limit?: number;
  offset?: number;
}

export const useGetAdminUsers = ({
  search,
  limit = 25,
  offset = 0,
}: UseGetAdminUsersProps = {}) => {
  const query = useQuery({
    queryKey: ["admin-users", search, limit, offset],
    queryFn: async () => {
      const response = await client.api.admin.users.$get({
        query: {
          search,
          limit: String(limit),
          offset: String(offset),
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch users");
      }

      const { data } = await response.json();

      return data;
    },
  });

  return query;
};
