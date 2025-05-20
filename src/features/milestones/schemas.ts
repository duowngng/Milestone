import { z } from "zod";

export const createMilestoneSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  date: z.coerce.date(),
  projectId: z.string(),
  workspaceId: z.string(),
});

export const updateMilestoneSchema = z.object({
  name: z.string().trim().min(1, "Must be at least 1 character").optional(),
  date: z.coerce.date(),
});
