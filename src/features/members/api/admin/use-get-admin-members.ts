import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMembersProps {
  name?: string | null;
  role?: string | null;
  createdAt?: string | null;
}

export const useGetMembers = ({
  name,
  role,
  createdAt,
}: UseGetMembersProps = {}) => {
  return useQuery({
    queryKey: ["admin-members", name, role, createdAt],
    queryFn: async () => {
      const response = await client.api.admin.members.$get({
        query: {
          name: name ?? undefined,
          role: role ?? undefined,
          createdAt: createdAt ?? undefined,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }

      const { data } = await response.json();

      return data;
    },
  });
};
