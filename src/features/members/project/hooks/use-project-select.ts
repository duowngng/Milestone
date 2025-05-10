import { parseAsString, useQueryStates } from "nuqs";

export const useProjectSelect = () => {
  return useQueryStates({
    projectId: parseAsString,
  });
};
