import { useQuery } from "@tanstack/react-query";

import { client } from "@/lib/rpc";

interface UseGetProjectMemberProps {
  memberId: string;
}

export const useGetProjectMember = ({ memberId }: UseGetProjectMemberProps) => {
  return useQuery({
    queryKey: ["admin-project-member", memberId],
    queryFn: async () => {
      const response = await client.api.admin.members.project[":memberId"].$get(
        {
          param: { memberId },
        }
      );

      if (!response.ok) {
        throw new Error("Failed to fetch project member");
      }

      const { data } = await response.json();

      return data;
    },
  });
};
