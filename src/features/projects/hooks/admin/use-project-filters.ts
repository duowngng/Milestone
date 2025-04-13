import { parseAsString, useQueryStates } from "nuqs";

export const useProjectFilters = () => {
  return useQueryStates({
    name: parseAsString,
    workspaceId: parseAsString,
    createdAt: parseAsString,
    updatedAt: parseAsString,
  });
};
