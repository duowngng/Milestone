import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetMemberProps {
  memberId: string;
}

export const useGetMember = ({ memberId }: UseGetMemberProps) => {
  return useQuery({
    queryKey: ["admin-member", memberId],
    queryFn: async () => {
      const response = await client.api.admin.members[":memberId"].$get({
        param: { memberId },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch member");
      }

      const { data } = await response.json();

      return data;
    },
  });
};
