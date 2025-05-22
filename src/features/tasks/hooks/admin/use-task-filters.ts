import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { TaskStatus, TaskPriority } from "../../types";

export const useAdminTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    assigneeId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    priority: parseAsStringEnum(Object.values(TaskPriority)),
    name: parseAsString,
    startDate: parseAsString,
    dueDate: parseAsString,
    progress: parseAsString,
    createdAt: parseAsString,
    updatedAt: parseAsString,
  });
};
