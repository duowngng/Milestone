import { z } from "zod";
import { TaskPriority, TaskStatus } from "./types";

export const createTaskSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  status: z.nativeEnum(TaskStatus, { required_error: "Required" }),
  workspaceId: z.string().trim().min(1, "Required"),
  projectId: z.string().trim().min(1, "Required"),
  startDate: z.coerce.date(),
  dueDate: z.coerce.date(),
  assigneeId: z.string().trim().min(1, "Required"),
  progress: z.string().trim().min(1, "Required"),
  priority: z.nativeEnum(TaskPriority, { required_error: "Required" }),
  description: z.string().optional(),
});
