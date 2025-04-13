import { parseAsString, useQueryStates } from "nuqs";

export const useWorkspaceFilters = () => {
  return useQueryStates({
    name: parseAsString,
    userId: parseAsString,
    createdAt: parseAsString,
    updatedAt: parseAsString,
  });
};
