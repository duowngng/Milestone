import { z } from "zod";

export const createHistorySchema = z.object({
  taskId: z.string().trim().min(1, "Required"),
  editorId: z.string().trim().min(1, "Required"),
  fields: z.array(z.string()),
  oldValues: z.record(z.any()),
  newValues: z.record(z.any()),
});
