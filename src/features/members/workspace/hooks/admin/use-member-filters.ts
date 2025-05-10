import { parseAsString, useQueryStates } from "nuqs";

export const useMemberFilters = () => {
  return useQueryStates({
    userId: parseAsString,
    workspaceId: parseAsString,
    role: parseAsString,
    createdAt: parseAsString,
    updatedAt: parseAsString,
  });
};
