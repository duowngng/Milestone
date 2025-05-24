import { parseAsString, parseAsStringEnum, useQueryStates } from "nuqs";

import { TaskStatus, TaskPriority } from "../types";

export const useTaskFilters = () => {
  return useQueryStates({
    projectId: parseAsString,
    status: parseAsStringEnum(Object.values(TaskStatus)),
    priority: parseAsStringEnum(Object.values(TaskPriority)),
    assigneeId: parseAsString,
    search: parseAsString,
    startDate: parseAsString,
    dueDate: parseAsString,
    progress: parseAsString,
  });
};
